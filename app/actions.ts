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

export async function createContactAction(formData: FormData) {
  const input = parseContactInput(formData);
  const contact = await createContact(input);
  revalidatePath("/");
  redirect(`/contacts/${contact.id}`);
}

export async function updateContactAction(id: string, formData: FormData) {
  const input = parseContactInput(formData);
  await updateContact(id, input);
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

export async function createInteractionAction(contactId: string, formData: FormData) {
  const input = parseInteractionInput(formData);
  await createInteraction(contactId, input);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function updateInteractionAction(
  contactId: string,
  interactionId: string,
  formData: FormData
) {
  const input = parseInteractionInput(formData);
  await updateInteraction(interactionId, input);
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

  return {
    company,
    role: optional("role"),
    startDate: optional("startDate"),
    endDate: optional("endDate"),
    isCurrent: formData.get("isCurrent") === "on",
  };
}

export async function createEmploymentAction(contactId: string, formData: FormData) {
  const input = parseEmploymentInput(formData);
  await createContactEmployment(contactId, input);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function updateEmploymentAction(
  contactId: string,
  employmentId: string,
  formData: FormData
) {
  const input = parseEmploymentInput(formData);
  await updateContactEmployment(employmentId, input);
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

  return {
    school,
    degree: optional("degree"),
    fieldOfStudy: optional("fieldOfStudy"),
    startDate: optional("startDate"),
    endDate: optional("endDate"),
  };
}

export async function createEducationAction(contactId: string, formData: FormData) {
  const input = parseEducationInput(formData);
  await createContactEducation(contactId, input);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function updateEducationAction(
  contactId: string,
  educationId: string,
  formData: FormData
) {
  const input = parseEducationInput(formData);
  await updateContactEducation(educationId, input);
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

export async function createLocationAction(contactId: string, formData: FormData) {
  const input = parseLocationInput(formData);
  await createContactLocation(contactId, input);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function updateLocationAction(
  contactId: string,
  locationId: string,
  formData: FormData
) {
  const input = parseLocationInput(formData);
  await updateContactLocation(locationId, input);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}

export async function deleteLocationAction(contactId: string, locationId: string) {
  await deleteContactLocation(locationId);
  revalidatePath(`/contacts/${contactId}`);
  redirect(`/contacts/${contactId}`);
}
