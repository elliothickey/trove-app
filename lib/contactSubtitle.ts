import type { ContactEducation, ContactEmployment, ContactLocation } from "@/lib/types";

// Shared recency comparator for employment/education: prefer the record with
// the later start date, falling back to whichever was updated most recently
// when start dates are equal or absent -- keeps the pick deterministic when
// multiple rows tie (e.g. two "current" jobs with no start date).
function byRecency(a: { startDate?: string; updatedAt: string }, b: { startDate?: string; updatedAt: string }): number {
  if (a.startDate && b.startDate) {
    return b.startDate.localeCompare(a.startDate);
  }
  if (a.startDate) return -1;
  if (b.startDate) return 1;
  return b.updatedAt.localeCompare(a.updatedAt);
}

function pickEmployment(employment: ContactEmployment[]): ContactEmployment | undefined {
  if (employment.length === 0) return undefined;
  const current = employment.filter((item) => item.isCurrent);
  const pool = current.length > 0 ? current : employment;
  return [...pool].sort(byRecency)[0];
}

function pickEducation(education: ContactEducation[]): ContactEducation | undefined {
  if (education.length === 0) return undefined;
  return [...education].sort(byRecency)[0];
}

function pickLocation(locations: ContactLocation[]): ContactLocation | undefined {
  if (locations.length === 0) return undefined;
  const current = locations.filter((item) => item.kind === "current");
  const pool = current.length > 0 ? current : locations;
  return [...pool].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

function formatEmployment(employment: ContactEmployment): string {
  return [employment.company, employment.role].filter(Boolean).join(" · ");
}

function formatEducation(education: ContactEducation): string {
  return [education.school, education.fieldOfStudy].filter(Boolean).join(" · ");
}

export function resolveContactSubtitle(input: {
  employment: ContactEmployment[];
  education: ContactEducation[];
  locations: ContactLocation[];
  legacyEmployer?: string;
  legacyLocation?: string;
}): string {
  const employment = pickEmployment(input.employment);
  if (employment) return formatEmployment(employment);

  const education = pickEducation(input.education);
  if (education) return formatEducation(education);

  const location = pickLocation(input.locations);
  if (location) return location.location;

  const legacy = [input.legacyEmployer, input.legacyLocation].filter(Boolean).join(" · ");
  return legacy || "No details yet";
}
