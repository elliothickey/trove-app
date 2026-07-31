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
