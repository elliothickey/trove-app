import { normalizeText } from "@/lib/textMatch";
import type {
  Contact,
  ContactEducation,
  ContactEmployment,
  ContactLocation,
  Interaction,
} from "@/lib/types";

// Normalizes each value (trim/collapse whitespace/lowercase) and drops any
// that end up empty, so joining them can't introduce stray double spaces or
// literal "undefined" substrings.
function collect(...values: (string | undefined)[]): string[] {
  return values.map((value) => normalizeText(value)).filter((value): value is string => Boolean(value));
}

// Builds one normalized, space-joined string containing every searchable
// field across a contact and ALL of its normalized employment/education/
// location records and interactions -- unlike lib/contactSubtitle.ts, which
// picks a single "best" record per category, search needs every record so
// e.g. a contact's older job or an interaction's raw notes stay findable.
export function buildContactSearchText(input: {
  contact: Contact;
  employment: ContactEmployment[];
  education: ContactEducation[];
  locations: ContactLocation[];
  interactions: Interaction[];
}): string {
  const parts: string[] = [
    ...collect(
      input.contact.name,
      input.contact.notes,
      input.contact.employer,
      input.contact.school,
      input.contact.location
    ),
    ...collect(...input.contact.tags),
  ];

  for (const item of input.employment) {
    parts.push(...collect(item.company, item.role, item.startDateText, item.endDateText));
  }

  for (const item of input.education) {
    parts.push(...collect(item.school, item.degree, item.fieldOfStudy, item.startDateText, item.endDateText));
  }

  for (const item of input.locations) {
    parts.push(...collect(item.location, item.kind));
  }

  for (const item of input.interactions) {
    parts.push(...collect(item.summary, item.notes, item.rawNotes, item.type));
  }

  return parts.join(" ");
}
