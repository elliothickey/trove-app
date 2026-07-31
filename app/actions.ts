"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createContact, deleteContact, updateContact } from "@/lib/data";
import type { ContactInput } from "@/lib/types";

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
