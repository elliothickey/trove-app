import { promises as fs } from "fs";
import path from "path";
import type { Contact, ContactInput, Interaction, InteractionInput } from "@/lib/types";

const dataFilePath = path.join(process.cwd(), "data", "contacts.json");
const interactionsFilePath = path.join(process.cwd(), "data", "interactions.json");

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

async function readInteractions(): Promise<Interaction[]> {
  const raw = await fs.readFile(interactionsFilePath, "utf-8");
  return JSON.parse(raw) as Interaction[];
}

async function writeInteractions(interactions: Interaction[]): Promise<void> {
  await fs.writeFile(
    interactionsFilePath,
    JSON.stringify(interactions, null, 2) + "\n",
    "utf-8"
  );
}

export async function getInteractionsForContact(contactId: string): Promise<Interaction[]> {
  const interactions = await readInteractions();
  return interactions
    .filter((interaction) => interaction.contactId === contactId)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export async function getInteraction(id: string): Promise<Interaction | undefined> {
  const interactions = await readInteractions();
  return interactions.find((interaction) => interaction.id === id);
}

export async function createInteraction(
  contactId: string,
  input: InteractionInput
): Promise<Interaction> {
  const interactions = await readInteractions();
  const now = new Date().toISOString();
  const interaction: Interaction = {
    id: crypto.randomUUID(),
    contactId,
    ...input,
    rawNotes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
  interactions.push(interaction);
  await writeInteractions(interactions);
  return interaction;
}

export async function updateInteraction(
  id: string,
  input: InteractionInput
): Promise<Interaction> {
  const interactions = await readInteractions();
  const index = interactions.findIndex((interaction) => interaction.id === id);
  if (index === -1) {
    throw new Error(`Interaction not found: ${id}`);
  }
  const updated: Interaction = {
    ...interactions[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  interactions[index] = updated;
  await writeInteractions(interactions);
  return updated;
}

export async function deleteInteraction(id: string): Promise<void> {
  const interactions = await readInteractions();
  const remaining = interactions.filter((interaction) => interaction.id !== id);
  await writeInteractions(remaining);
}
