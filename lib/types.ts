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

export type ContactEducation = {
  id: string;
  contactId: string;
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactEducationInput = {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
};

export type ContactEmployment = {
  id: string;
  contactId: string;
  company: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ContactEmploymentInput = {
  company: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
};

export type ContactLocationKind = "hometown" | "current" | "previous";

export type ContactLocation = {
  id: string;
  contactId: string;
  kind?: ContactLocationKind;
  location: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactLocationInput = {
  kind?: ContactLocationKind;
  location: string;
};
