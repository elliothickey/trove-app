"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createContact,
  createInteraction,
  deleteContact,
  deleteInteraction,
  updateContact,
  updateInteraction,
} from "@/lib/data";
import type { ContactInput, InteractionInput, InteractionType } from "@/lib/types";

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
