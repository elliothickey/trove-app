import { promises as fs } from "fs";
import path from "path";
import type { Contact, ContactInput } from "@/lib/types";

const dataFilePath = path.join(process.cwd(), "data", "contacts.json");

async function readContacts(): Promise<Contact[]> {
  const raw = await fs.readFile(dataFilePath, "utf-8");
  return JSON.parse(raw) as Contact[];
}

async function writeContacts(contacts: Contact[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(contacts, null, 2) + "\n", "utf-8");
}

export async function getContacts(): Promise<Contact[]> {
  const contacts = await readContacts();
  return contacts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getContact(id: string): Promise<Contact | undefined> {
  const contacts = await readContacts();
  return contacts.find((contact) => contact.id === id);
}

export async function createContact(input: ContactInput): Promise<Contact> {
  const contacts = await readContacts();
  const now = new Date().toISOString();
  const contact: Contact = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  contacts.push(contact);
  await writeContacts(contacts);
  return contact;
}

export async function updateContact(id: string, input: ContactInput): Promise<Contact> {
  const contacts = await readContacts();
  const index = contacts.findIndex((contact) => contact.id === id);
  if (index === -1) {
    throw new Error(`Contact not found: ${id}`);
  }
  const updated: Contact = {
    ...contacts[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  contacts[index] = updated;
  await writeContacts(contacts);
  return updated;
}

export async function deleteContact(id: string): Promise<void> {
  const contacts = await readContacts();
  const remaining = contacts.filter((contact) => contact.id !== id);
  await writeContacts(remaining);
}
