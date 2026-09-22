"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractContactFromNote, ExtractionError } from "@/lib/ai/extractContact";
import type { ExtractedContact, ExtractedEducation, ExtractedEmployment, ExtractedLocation } from "@/lib/ai/types";
import { normalizeText } from "@/lib/textMatch";
import type { Contact, ContactEducation, ContactEmployment, ContactLocation } from "@/lib/types";
import {
  createContact,
  createContactEducation,
  createContactEmployment,
  createContactLocation,
  createInteraction,
  deleteContact,
  findContactsByName,
  getContact,
  getEducationForContact,
  getEmploymentForContact,
  getLocationsForContact,
} from "@/lib/data";

export type QuickCaptureState =
  | { status: "idle" }
  | { status: "error"; note: string; error: string }
  | { status: "success"; note: string; extracted: ExtractedContact };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error("Not authenticated");
  }
}

function messageForError(error: ExtractionError): string {
  switch (error.code) {
    case "empty_input":
      return "Paste a note before extracting.";
    case "missing_config":
      return "AI extraction isn't configured on the server. Contact the site administrator.";
    case "api_error":
      return "The AI service couldn't process this note. Please try again in a moment.";
    case "invalid_output":
      return "The AI returned an unexpected response. Please try again.";
  }
}

export async function extractQuickCaptureAction(
  _prevState: QuickCaptureState,
  formData: FormData
): Promise<QuickCaptureState> {
  const note = String(formData.get("note") ?? "");

  // Every Quick Capture request must come from an authenticated user, even
  // though proxy.ts already blocks anonymous access to this route -- same
  // defense-in-depth pattern as requireUser() in lib/data.ts.
  await requireUser();

  try {
    const extracted = await extractContactFromNote(note);
    return { status: "success", note, extracted };
  } catch (err) {
    if (err instanceof ExtractionError) {
      return { status: "error", note, error: messageForError(err) };
    }
    return { status: "error", note, error: "Something went wrong while extracting. Please try again." };
  }
}

export type SaveQuickCaptureInput = {
  rawNote: string;
  name: string;
  employment: ExtractedEmployment[];
  education: ExtractedEducation[];
  locations: ExtractedLocation[];
  interactionSummary: string;
  notes: string;
  // Set only when the user explicitly picked an existing contact from the
  // duplicate-name confirmation step -- never inferred or defaulted here.
  // Always re-validated server-side against the caller's own contacts
  // (see saveQuickCaptureContactAction) rather than trusted as-is.
  existingContactId?: string;
};

export type SaveQuickCaptureResult = { status: "error"; error: string };

// Exact, case-insensitive, whitespace-normalized name match only -- run once,
// at Save time, against the final edited name. Never fuzzy, never automatic:
// the caller (QuickCaptureReview) always makes the user choose explicitly
// between a returned match and "different person" before anything is saved.
export async function findExistingContactMatchesAction(name: string): Promise<Contact[]> {
  await requireUser();
  return findContactsByName(name);
}

const EXACT_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Only an exact YYYY-MM-DD can go in the strict `date` columns without
// inventing a day/month the source never stated. Anything else (a bare
// year, "Summer 2024", etc.) is preserved as-written in the *DateText
// sibling column instead of being silently dropped.
function splitDate(value?: string): { exact?: string; text?: string } {
  const trimmed = value?.trim();
  if (!trimmed) return {};
  return EXACT_DATE_RE.test(trimmed) ? { exact: trimmed } : { text: trimmed };
}

// A single "as displayed" value for a date that may be stored as either an
// exact `date` column or an "as written" text sibling -- lets an existing DB
// row and a freshly-split extracted value be compared like-for-like.
function dateKey(exact?: string | null, text?: string | null): string | undefined {
  return normalizeText(exact) ?? normalizeText(text);
}

// Conservative, name-only-plus-populated-fields dedup for structured child
// records on an EXISTING contact. Two records are only treated as the same
// fact when every field populated on either side matches (normalized) --
// any field that differs (e.g. a different role or date range at the same
// company) means they're kept as separate history, not collapsed. This is
// intentionally strict: when in doubt, the new record is preserved rather
// than silently discarded (e.g. Analyst 2015-2017 vs. VP 2022-present at the
// same company are two rows, not one).
function isDuplicateEmployment(existing: ContactEmployment, item: ExtractedEmployment): boolean {
  const start = splitDate(item.startDate);
  const end = splitDate(item.endDate);
  return (
    normalizeText(existing.company) === normalizeText(item.company) &&
    normalizeText(existing.role) === normalizeText(item.role) &&
    dateKey(existing.startDate, existing.startDateText) === dateKey(start.exact, start.text) &&
    dateKey(existing.endDate, existing.endDateText) === dateKey(end.exact, end.text) &&
    (existing.isCurrent ?? undefined) === (item.isCurrent ?? undefined)
  );
}

function isDuplicateEducation(existing: ContactEducation, item: ExtractedEducation): boolean {
  const start = splitDate(item.startDate);
  const end = splitDate(item.endDate);
  return (
    normalizeText(existing.school) === normalizeText(item.school) &&
    normalizeText(existing.degree) === normalizeText(item.degree) &&
    normalizeText(existing.fieldOfStudy) === normalizeText(item.fieldOfStudy) &&
    dateKey(existing.startDate, existing.startDateText) === dateKey(start.exact, start.text) &&
    dateKey(existing.endDate, existing.endDateText) === dateKey(end.exact, end.text)
  );
}

function isDuplicateLocation(existing: ContactLocation, item: ExtractedLocation): boolean {
  return (
    normalizeText(existing.location) === normalizeText(item.location) &&
    (existing.kind ?? undefined) === (item.kind ?? undefined)
  );
}

export async function saveQuickCaptureContactAction(
  input: SaveQuickCaptureInput
): Promise<SaveQuickCaptureResult> {
  await requireUser();

  const name = input.name.trim();
  if (!name) {
    return { status: "error", error: "Add a name before saving." };
  }

  // input.rawNote itself must reach raw_notes byte-for-byte -- trimmedRawNote
  // exists only for emptiness checks and the fallback summary below, never
  // for the value actually persisted.
  const trimmedRawNote = input.rawNote.trim();
  const interactionSummary = input.interactionSummary.trim();
  const notes = input.notes.trim();

  let contactId: string | undefined;
  // Only true when THIS call created the contact -- rollback below must
  // never delete a pre-existing contact the user explicitly chose to attach
  // to, even if a later step in this same save fails.
  let createdNewContact = false;
  try {
    if (input.existingContactId) {
      // Never trust the id from the client as-is: re-look it up through the
      // RLS-scoped data layer so a stale or forged id can't attach an
      // interaction to a contact the caller doesn't own (or that no longer
      // exists).
      const existing = await getContact(input.existingContactId);
      if (!existing) {
        return {
          status: "error",
          error: "That contact could no longer be found. Please try saving again.",
        };
      }
      contactId = existing.id;
    } else {
      const contact = await createContact({
        name,
        tags: [],
        notes: notes || undefined,
      });
      contactId = contact.id;
      createdNewContact = true;
    }

    // Only fetch what's already on the contact when attaching to an existing
    // one -- a brand-new contact has nothing to dedup against, so every
    // extracted item is inserted as before.
    const existingEmployment: ContactEmployment[] = createdNewContact
      ? []
      : await getEmploymentForContact(contactId);
    const existingEducation: ContactEducation[] = createdNewContact
      ? []
      : await getEducationForContact(contactId);
    const existingLocations: ContactLocation[] = createdNewContact
      ? []
      : await getLocationsForContact(contactId);

    for (const item of input.employment) {
      const company = item.company.trim();
      if (!company) continue;
      if (existingEmployment.some((existing) => isDuplicateEmployment(existing, item))) continue;
      const start = splitDate(item.startDate);
      const end = splitDate(item.endDate);
      await createContactEmployment(contactId, {
        company,
        role: item.role?.trim() || undefined,
        startDate: start.exact,
        startDateText: start.text,
        endDate: end.exact,
        endDateText: end.text,
        isCurrent: item.isCurrent,
      });
    }

    for (const item of input.education) {
      const school = item.school.trim();
      if (!school) continue;
      if (existingEducation.some((existing) => isDuplicateEducation(existing, item))) continue;
      const start = splitDate(item.startDate);
      const end = splitDate(item.endDate);
      await createContactEducation(contactId, {
        school,
        degree: item.degree?.trim() || undefined,
        fieldOfStudy: item.fieldOfStudy?.trim() || undefined,
        startDate: start.exact,
        startDateText: start.text,
        endDate: end.exact,
        endDateText: end.text,
      });
    }

    for (const item of input.locations) {
      const location = item.location.trim();
      if (!location) continue;
      if (existingLocations.some((existing) => isDuplicateLocation(existing, item))) continue;
      await createContactLocation(contactId, {
        location,
        kind: item.kind,
      });
    }

    // input.rawNote (untrimmed) is stored as this interaction's `notes` at
    // creation time, which lib/data.ts's createInteraction also copies
    // verbatim into the immutable `raw_notes` column -- that's what
    // preserves the original Quick Capture text exactly as submitted,
    // permanently, even if the interaction's notes are edited later. This
    // always runs, regardless of how many (if any) structured records above
    // were skipped as duplicates.
    await createInteraction(contactId, {
      type: "other",
      occurredAt: new Date().toISOString(),
      summary: interactionSummary || trimmedRawNote.slice(0, 280) || "Quick Capture",
      notes: trimmedRawNote ? input.rawNote : undefined,
    });
  } catch (err) {
    // Best-effort rollback so a retry doesn't create a duplicate contact --
    // the FK `on delete cascade` on the child tables cleans up any partial
    // employment/education/location/interaction rows too. Never applies to
    // an existing contact the user chose to attach to.
    if (createdNewContact && contactId) {
      try {
        await deleteContact(contactId);
      } catch {
        // Swallow -- surface the original error below either way. In the
        // rare case this cleanup itself fails, a partial contact may be left
        // behind for manual review.
      }
    }
    return {
      status: "error",
      error: err instanceof Error ? err.message : "Something went wrong while saving.",
    };
  }

  revalidatePath("/");
  redirect(`/contacts/${contactId}`);
}
