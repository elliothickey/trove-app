import { createClient } from "@/lib/supabase/server";
import { normalizeText } from "@/lib/textMatch";
import { resolveContactSubtitle } from "@/lib/contactSubtitle";
import type {
  Contact,
  ContactInput,
  ContactListItem,
  ContactEducation,
  ContactEducationInput,
  ContactEmployment,
  ContactEmploymentInput,
  ContactLocation,
  ContactLocationInput,
  Interaction,
  InteractionInput,
} from "@/lib/types";

type ContactRow = {
  id: string;
  name: string;
  employer: string | null;
  school: string | null;
  location: string | null;
  tags: string[];
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type InteractionRow = {
  id: string;
  contact_id: string;
  type: string;
  occurred_at: string;
  location: string | null;
  summary: string;
  notes: string | null;
  raw_notes: string | null;
  created_at: string;
  updated_at: string;
};

type ContactEducationRow = {
  id: string;
  contact_id: string;
  school: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  start_date_text: string | null;
  end_date_text: string | null;
  created_at: string;
  updated_at: string;
};

type ContactEmploymentRow = {
  id: string;
  contact_id: string;
  company: string;
  role: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean | null;
  start_date_text: string | null;
  end_date_text: string | null;
  created_at: string;
  updated_at: string;
};

type ContactLocationRow = {
  id: string;
  contact_id: string;
  kind: string | null;
  location: string;
  created_at: string;
  updated_at: string;
};

function rowToContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    employer: row.employer ?? undefined,
    school: row.school ?? undefined,
    location: row.location ?? undefined,
    tags: row.tags ?? [],
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function contactInputToRow(input: ContactInput) {
  return {
    name: input.name,
    employer: input.employer ?? null,
    school: input.school ?? null,
    location: input.location ?? null,
    tags: input.tags,
    email: input.email ?? null,
    phone: input.phone ?? null,
    notes: input.notes ?? null,
  };
}

function rowToInteraction(row: InteractionRow): Interaction {
  return {
    id: row.id,
    contactId: row.contact_id,
    type: row.type as Interaction["type"],
    occurredAt: row.occurred_at,
    location: row.location ?? undefined,
    summary: row.summary,
    notes: row.notes ?? undefined,
    rawNotes: row.raw_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Excludes raw_notes deliberately: that column is set once at creation time
// and must stay immutable on every subsequent update (see updateInteraction).
function interactionInputToRow(input: InteractionInput) {
  return {
    type: input.type,
    occurred_at: input.occurredAt,
    location: input.location ?? null,
    summary: input.summary,
    notes: input.notes ?? null,
  };
}

function rowToContactEducation(row: ContactEducationRow): ContactEducation {
  return {
    id: row.id,
    contactId: row.contact_id,
    school: row.school,
    degree: row.degree ?? undefined,
    fieldOfStudy: row.field_of_study ?? undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    startDateText: row.start_date_text ?? undefined,
    endDateText: row.end_date_text ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function contactEducationInputToRow(input: ContactEducationInput) {
  return {
    school: input.school,
    degree: input.degree ?? null,
    field_of_study: input.fieldOfStudy ?? null,
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    start_date_text: input.startDateText ?? null,
    end_date_text: input.endDateText ?? null,
  };
}

function rowToContactEmployment(row: ContactEmploymentRow): ContactEmployment {
  return {
    id: row.id,
    contactId: row.contact_id,
    company: row.company,
    role: row.role ?? undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    isCurrent: row.is_current ?? undefined,
    startDateText: row.start_date_text ?? undefined,
    endDateText: row.end_date_text ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function contactEmploymentInputToRow(input: ContactEmploymentInput) {
  return {
    company: input.company,
    role: input.role ?? null,
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    is_current: input.isCurrent ?? null,
    start_date_text: input.startDateText ?? null,
    end_date_text: input.endDateText ?? null,
  };
}

function rowToContactLocation(row: ContactLocationRow): ContactLocation {
  return {
    id: row.id,
    contactId: row.contact_id,
    kind: (row.kind as ContactLocation["kind"]) ?? undefined,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function contactLocationInputToRow(input: ContactLocationInput) {
  return {
    kind: input.kind ?? null,
    location: input.location,
  };
}

/**
 * Resolves the authenticated user from the server-side Supabase client.
 * Every mutating function below calls this and uses the returned user's id
 * as `user_id` -- that value never comes from form/client input, and RLS
 * independently enforces the same ownership on top of it.
 */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Not authenticated");
  }
  return { supabase, user };
}

export async function getContacts(): Promise<Contact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return (data as ContactRow[]).map(rowToContact);
}

export async function getContact(id: string): Promise<Contact | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? rowToContact(data as ContactRow) : undefined;
}

function groupByContactId<T extends { contactId: string }>(rows: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const existing = grouped.get(row.contactId);
    if (existing) {
      existing.push(row);
    } else {
      grouped.set(row.contactId, [row]);
    }
  }
  return grouped;
}

// Contacts for the list view, each with a `subtitle` resolved from its
// normalized employment/education/location records. Batch-fetches all three
// child tables for the whole contact list (one query each, filtered by
// `contact_id in (...)`) instead of querying per contact.
export async function getContactsForList(): Promise<ContactListItem[]> {
  const contacts = await getContacts();
  if (contacts.length === 0) {
    return [];
  }

  const supabase = await createClient();
  const contactIds = contacts.map((contact) => contact.id);

  const [employmentRes, educationRes, locationRes] = await Promise.all([
    supabase.from("contact_employment").select("*").in("contact_id", contactIds),
    supabase.from("contact_education").select("*").in("contact_id", contactIds),
    supabase.from("contact_locations").select("*").in("contact_id", contactIds),
  ]);
  if (employmentRes.error) throw new Error(employmentRes.error.message);
  if (educationRes.error) throw new Error(educationRes.error.message);
  if (locationRes.error) throw new Error(locationRes.error.message);

  const employmentByContact = groupByContactId(
    (employmentRes.data as ContactEmploymentRow[]).map(rowToContactEmployment)
  );
  const educationByContact = groupByContactId(
    (educationRes.data as ContactEducationRow[]).map(rowToContactEducation)
  );
  const locationsByContact = groupByContactId(
    (locationRes.data as ContactLocationRow[]).map(rowToContactLocation)
  );

  return contacts.map((contact) => ({
    ...contact,
    subtitle: resolveContactSubtitle({
      employment: employmentByContact.get(contact.id) ?? [],
      education: educationByContact.get(contact.id) ?? [],
      locations: locationsByContact.get(contact.id) ?? [],
      legacyEmployer: contact.employer,
      legacyLocation: contact.location,
    }),
  }));
}

// Exact, case-insensitive, whitespace-normalized name match against the
// caller's own contacts (getContacts() is RLS-scoped). Used by Quick Capture
// to surface a possible existing contact before creating a new one -- never
// to merge or attach automatically.
export async function findContactsByName(name: string): Promise<Contact[]> {
  const target = normalizeText(name);
  if (!target) return [];
  const contacts = await getContacts();
  return contacts.filter((contact) => normalizeText(contact.name) === target);
}

export async function createContact(input: ContactInput): Promise<Contact> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...contactInputToRow(input), user_id: user.id })
    .select()
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create contact");
  }
  return rowToContact(data as ContactRow);
}

export async function updateContact(id: string, input: ContactInput): Promise<Contact> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("contacts")
    .update({ ...contactInputToRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(`Contact not found: ${id}`);
  }
  return rowToContact(data as ContactRow);
}

export async function deleteContact(id: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function getInteractionsForContact(contactId: string): Promise<Interaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("contact_id", contactId)
    .order("occurred_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data as InteractionRow[]).map(rowToInteraction);
}

export async function getInteraction(id: string): Promise<Interaction | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? rowToInteraction(data as InteractionRow) : undefined;
}

export async function createInteraction(
  contactId: string,
  input: InteractionInput
): Promise<Interaction> {
  const { supabase, user } = await requireUser();

  // Application-layer ownership check: getContact() is itself RLS-scoped to
  // the caller, so it returns undefined both when the contact doesn't exist
  // and when it belongs to someone else -- exactly the behavior we want.
  const contact = await getContact(contactId);
  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  const { data, error } = await supabase
    .from("interactions")
    .insert({
      ...interactionInputToRow(input),
      raw_notes: input.notes ?? null,
      user_id: user.id,
      contact_id: contactId,
    })
    .select()
    .single();

  if (error) {
    // Postgres 42501 = row-level security policy violation. The DB-level
    // ownership check (migration 0002) is an independent backstop for the
    // same rule enforced above -- if it ever trips (e.g. a race where the
    // contact changed hands between the check and the insert), surface the
    // same not-found message instead of a raw Postgres error.
    if (error.code === "42501") {
      throw new Error(`Contact not found: ${contactId}`);
    }
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(`Contact not found: ${contactId}`);
  }
  return rowToInteraction(data as InteractionRow);
}

export async function updateInteraction(
  id: string,
  input: InteractionInput
): Promise<Interaction> {
  const { supabase } = await requireUser();
  // InteractionInput has no contactId, so updates can never repoint an
  // interaction at a different contact -- no ownership re-check needed here.
  const { data, error } = await supabase
    .from("interactions")
    .update({ ...interactionInputToRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(`Interaction not found: ${id}`);
  }
  return rowToInteraction(data as InteractionRow);
}

export async function deleteInteraction(id: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("interactions").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function getEducationForContact(contactId: string): Promise<ContactEducation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_education")
    .select("*")
    .eq("contact_id", contactId)
    .order("start_date", { ascending: false, nullsFirst: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data as ContactEducationRow[]).map(rowToContactEducation);
}

export async function getContactEducation(id: string): Promise<ContactEducation | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_education")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? rowToContactEducation(data as ContactEducationRow) : undefined;
}

export async function createContactEducation(
  contactId: string,
  input: ContactEducationInput
): Promise<ContactEducation> {
  const { supabase, user } = await requireUser();

  const contact = await getContact(contactId);
  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  const { data, error } = await supabase
    .from("contact_education")
    .insert({
      ...contactEducationInputToRow(input),
      user_id: user.id,
      contact_id: contactId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "42501") {
      throw new Error(`Contact not found: ${contactId}`);
    }
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(`Contact not found: ${contactId}`);
  }
  return rowToContactEducation(data as ContactEducationRow);
}

export async function updateContactEducation(
  id: string,
  input: ContactEducationInput
): Promise<ContactEducation> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("contact_education")
    .update({ ...contactEducationInputToRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(`Contact education not found: ${id}`);
  }
  return rowToContactEducation(data as ContactEducationRow);
}

export async function deleteContactEducation(id: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("contact_education").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function getEmploymentForContact(contactId: string): Promise<ContactEmployment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_employment")
    .select("*")
    .eq("contact_id", contactId)
    .order("start_date", { ascending: false, nullsFirst: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data as ContactEmploymentRow[]).map(rowToContactEmployment);
}

export async function getContactEmployment(id: string): Promise<ContactEmployment | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_employment")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? rowToContactEmployment(data as ContactEmploymentRow) : undefined;
}

export async function createContactEmployment(
  contactId: string,
  input: ContactEmploymentInput
): Promise<ContactEmployment> {
  const { supabase, user } = await requireUser();

  const contact = await getContact(contactId);
  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  const { data, error } = await supabase
    .from("contact_employment")
    .insert({
      ...contactEmploymentInputToRow(input),
      user_id: user.id,
      contact_id: contactId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "42501") {
      throw new Error(`Contact not found: ${contactId}`);
    }
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(`Contact not found: ${contactId}`);
  }
  return rowToContactEmployment(data as ContactEmploymentRow);
}

export async function updateContactEmployment(
  id: string,
  input: ContactEmploymentInput
): Promise<ContactEmployment> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("contact_employment")
    .update({ ...contactEmploymentInputToRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(`Contact employment not found: ${id}`);
  }
  return rowToContactEmployment(data as ContactEmploymentRow);
}

export async function deleteContactEmployment(id: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("contact_employment").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function getLocationsForContact(contactId: string): Promise<ContactLocation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_locations")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return (data as ContactLocationRow[]).map(rowToContactLocation);
}

export async function getContactLocation(id: string): Promise<ContactLocation | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_locations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? rowToContactLocation(data as ContactLocationRow) : undefined;
}

export async function createContactLocation(
  contactId: string,
  input: ContactLocationInput
): Promise<ContactLocation> {
  const { supabase, user } = await requireUser();

  const contact = await getContact(contactId);
  if (!contact) {
    throw new Error(`Contact not found: ${contactId}`);
  }

  const { data, error } = await supabase
    .from("contact_locations")
    .insert({
      ...contactLocationInputToRow(input),
      user_id: user.id,
      contact_id: contactId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "42501") {
      throw new Error(`Contact not found: ${contactId}`);
    }
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(`Contact not found: ${contactId}`);
  }
  return rowToContactLocation(data as ContactLocationRow);
}

export async function updateContactLocation(
  id: string,
  input: ContactLocationInput
): Promise<ContactLocation> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("contact_locations")
    .update({ ...contactLocationInputToRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error(`Contact location not found: ${id}`);
  }
  return rowToContactLocation(data as ContactLocationRow);
}

export async function deleteContactLocation(id: string): Promise<void> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("contact_locations").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}
