"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createContact,
  createContactEducation,
  createContactEmployment,
  createContactLocation,
  createInteraction,
  deleteContact,
  deleteContactEducation,
  deleteContactEmployment,
  deleteContactLocation,
  deleteInteraction,
  updateContact,
  updateContactEducation,
  updateContactEmployment,
  updateContactLocation,
  updateInteraction,
} from "@/lib/data";
import type {
  ContactEducationInput,
  ContactEmploymentInput,
  ContactInput,
  ContactLocationInput,
  ContactLocationKind,
  InteractionInput,
  InteractionType,
} from "@/lib/types";

// Shared state shape for every create/update form action below, consumed via
// useActionState() in the matching form component. `error` is always a
// message that's safe to show verbatim -- see toValidationError() and
// toDataLayerError(), the only two places that produce one. `values` is the
// raw submitted form data, echoed back so the form can repopulate itself:
// React resets a <form action={fn}>'s uncontrolled fields to their current
// defaultValue whenever the action's transition completes (success or
// failure alike), so defaultValue must reflect what was just submitted, not
// the original database values, or a recoverable failure would silently
// discard the user's edits.
export type ActionFormState = { error?: string; values?: Record<string, string> };

// Only plain string form fields are echoed back -- never File values, and
// never React/Next's internal "$ACTION_..." bookkeeping keys (see the
// installed Next.js forms guide's note on Object.fromEntries(formData)).
function submittedValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION_")) {
      values[key] = value;
    }
  }
  return values;
}

// parse*Input() functions below only ever throw messages we wrote ourselves
// (e.g. "Name is required"), so they're always safe to surface as-is.
function toValidationError(err: unknown, formData: FormData): ActionFormState {
  return {
    error: err instanceof Error ? err.message : "Invalid input.",
    values: submittedValues(formData),
  };
}

// Data-layer failures (lib/data.ts) can carry raw Supabase/Postgres error
// text, which must never reach the user. Log the real error for debugging
// and return a generic, safe message instead -- except "Not authenticated"
// (thrown by requireUser()), which gets a specific, actionable message so a
// user whose session expired mid-form knows to sign back in rather than
// retrying the same failing save indefinitely.
function toDataLayerError(err: unknown, formData: FormData): ActionFormState {
  if (err instanceof Error && err.message === "Not authenticated") {
    return {
      error: "Your session has expired. Please sign in again, then retry.",
      values: submittedValues(formData),
    };
  }
  console.error(err);
  return {
    error: "Couldn't save your changes. Please try again.",
    values: submittedValues(formData),
  };
}

function parseContactInput(formData: FormData): ContactInput {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Name is required");
  }

  const tagsRaw = String(formData.get("tags") ?? "");
  const tags = tagsRaw
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  const optional = (key: string): string | undefined => {
    const value = String(formData.get(key) ?? "").trim();
    return value.length > 0 ? value : undefined;
  };

  return {
    name,
    employer: optional("employer"),
    school: optional("school"),
    location: optional("location"),
    tags,
    email: optional("email"),
    phone: optional("phone"),
    notes: optional("notes"),
  };
}

export async function createContactAction(
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: ContactInput;
  try {
    input = parseContactInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  let redirectPath: string;
  try {
    const contact = await createContact(input);
    redirectPath = `/contacts/${contact.id}`;
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath("/");
  redirect(redirectPath);
}

export async function updateContactAction(
  id: string,
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: ContactInput;
  try {
    input = parseContactInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  try {
    await updateContact(id, input);
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath("/");
  revalidatePath(`/contacts/${id}`);
  redirect(`/contacts/${id}`);
}

export async function deleteContactAction(id: string) {
  await deleteContact(id);
  revalidatePath("/");
  redirect("/");
}

const INTERACTION_TYPES: InteractionType[] = ["meeting", "call", "email", "message", "other"];

function parseInteractionInput(formData: FormData): InteractionInput {
  const summary = String(formData.get("summary") ?? "").trim();
  if (!summary) {
    throw new Error("Summary is required");
  }

  const occurredAtRaw = String(formData.get("occurredAt") ?? "").trim();
  if (!occurredAtRaw) {
    throw new Error("Date is required");
  }
  const occurredAt = new Date(occurredAtRaw).toISOString();

  const typeRaw = String(formData.get("type") ?? "");
  const type = INTERACTION_TYPES.includes(typeRaw as InteractionType)
    ? (typeRaw as InteractionType)
    : "other";

  const optional = (key: string): string | undefined => {
    const value = String(formData.get(key) ?? "").trim();
    return value.length > 0 ? value : undefined;
  };

  return {
    type,
    occurredAt,
    location: optional("location"),
    summary,
    notes: optional("notes"),
  };
}

export async function createInteractionAction(
  contactId: string,
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: InteractionInput;
  try {
    input = parseInteractionInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  try {
    await createInteraction(contactId, input);
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function updateInteractionAction(
  contactId: string,
  interactionId: string,
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: InteractionInput;
  try {
    input = parseInteractionInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  try {
    await updateInteraction(interactionId, input);
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function deleteInteractionAction(contactId: string, interactionId: string) {
  await deleteInteraction(interactionId);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

function parseEmploymentInput(formData: FormData): ContactEmploymentInput {
  const company = String(formData.get("company") ?? "").trim();
  if (!company) {
    throw new Error("Company is required");
  }

  const optional = (key: string): string | undefined => {
    const value = String(formData.get(key) ?? "").trim();
    return value.length > 0 ? value : undefined;
  };

  const startDate = optional("startDate");
  const endDate = optional("endDate");

  return {
    company,
    role: optional("role"),
    startDate,
    endDate,
    isCurrent: formData.get("isCurrent") === "on",
    // An exact date entered here supersedes any preserved "as written" text
    // for that same field; otherwise carry through whatever was already
    // stored (see the hidden fields in EmploymentForm).
    startDateText: startDate ? undefined : optional("startDateText"),
    endDateText: endDate ? undefined : optional("endDateText"),
  };
}

export async function createEmploymentAction(
  contactId: string,
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: ContactEmploymentInput;
  try {
    input = parseEmploymentInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  try {
    await createContactEmployment(contactId, input);
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function updateEmploymentAction(
  contactId: string,
  employmentId: string,
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: ContactEmploymentInput;
  try {
    input = parseEmploymentInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  try {
    await updateContactEmployment(employmentId, input);
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function deleteEmploymentAction(contactId: string, employmentId: string) {
  await deleteContactEmployment(employmentId);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

function parseEducationInput(formData: FormData): ContactEducationInput {
  const school = String(formData.get("school") ?? "").trim();
  if (!school) {
    throw new Error("School is required");
  }

  const optional = (key: string): string | undefined => {
    const value = String(formData.get(key) ?? "").trim();
    return value.length > 0 ? value : undefined;
  };

  const startDate = optional("startDate");
  const endDate = optional("endDate");

  return {
    school,
    degree: optional("degree"),
    fieldOfStudy: optional("fieldOfStudy"),
    startDate,
    endDate,
    // An exact date entered here supersedes any preserved "as written" text
    // for that same field; otherwise carry through whatever was already
    // stored (see the hidden fields in EducationForm).
    startDateText: startDate ? undefined : optional("startDateText"),
    endDateText: endDate ? undefined : optional("endDateText"),
  };
}

export async function createEducationAction(
  contactId: string,
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: ContactEducationInput;
  try {
    input = parseEducationInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  try {
    await createContactEducation(contactId, input);
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function updateEducationAction(
  contactId: string,
  educationId: string,
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: ContactEducationInput;
  try {
    input = parseEducationInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  try {
    await updateContactEducation(educationId, input);
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function deleteEducationAction(contactId: string, educationId: string) {
  await deleteContactEducation(educationId);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

const LOCATION_KINDS: ContactLocationKind[] = ["hometown", "current", "previous"];

function parseLocationInput(formData: FormData): ContactLocationInput {
  const location = String(formData.get("location") ?? "").trim();
  if (!location) {
    throw new Error("Location is required");
  }

  const kindRaw = String(formData.get("kind") ?? "");
  const kind = LOCATION_KINDS.includes(kindRaw as ContactLocationKind)
    ? (kindRaw as ContactLocationKind)
    : undefined;

  return { location, kind };
}

export async function createLocationAction(
  contactId: string,
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: ContactLocationInput;
  try {
    input = parseLocationInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  try {
    await createContactLocation(contactId, input);
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function updateLocationAction(
  contactId: string,
  locationId: string,
  _prevState: ActionFormState,
  formData: FormData
): Promise<ActionFormState> {
  let input: ContactLocationInput;
  try {
    input = parseLocationInput(formData);
  } catch (err) {
    return toValidationError(err, formData);
  }

  try {
    await updateContactLocation(locationId, input);
  } catch (err) {
    return toDataLayerError(err, formData);
  }

  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function deleteLocationAction(contactId: string, locationId: string) {
  await deleteContactLocation(locationId);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}
