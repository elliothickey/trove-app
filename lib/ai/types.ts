import type { ContactLocationKind } from "@/lib/types";

export type ExtractedEmployment = {
  company: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
};

export type ExtractedEducation = {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
};

export type ExtractedLocation = {
  location: string;
  kind?: ContactLocationKind;
};

export type ExtractedContact = {
  name?: string;
  employment: ExtractedEmployment[];
  education: ExtractedEducation[];
  locations: ExtractedLocation[];
  interactionSummary?: string;
  notes?: string;
};
