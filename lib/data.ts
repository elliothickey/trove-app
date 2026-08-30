import { createClient } from "@/lib/supabase/server";
import type { Contact, ContactInput, Interaction, InteractionInput } from "@/lib/types";

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
