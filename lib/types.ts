export type Contact = {
  id: string;
  name: string;
  employer?: string;
  school?: string;
  location?: string;
  tags: string[];
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactInput = {
  name: string;
  employer?: string;
  school?: string;
  location?: string;
  tags: string[];
  email?: string;
  phone?: string;
  notes?: string;
};

export type InteractionType = "meeting" | "call" | "email" | "message" | "other";

export type Interaction = {
  id: string;
  contactId: string;
  type: InteractionType;
  occurredAt: string;
  location?: string;
  summary: string;
  notes?: string;
  rawNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type InteractionInput = {
  type: InteractionType;
  occurredAt: string;
  location?: string;
  summary: string;
  notes?: string;
};
