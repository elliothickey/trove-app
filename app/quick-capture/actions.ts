"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractContactFromNote, ExtractionError } from "@/lib/ai/extractContact";
import type { ExtractedContact, ExtractedEducation, ExtractedEmployment, ExtractedLocation } from "@/lib/ai/types";
import {
  createContact,
  createContactEducation,
  createContactEmployment,
  createContactLocation,
  createInteraction,
  deleteContact,
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
};

export type SaveQuickCaptureResult = { status: "error"; error: string };

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
  try {
    const contact = await createContact({
      name,
      tags: [],
      notes: notes || undefined,
    });
    contactId = contact.id;

    for (const item of input.employment) {
      const company = item.company.trim();
      if (!company) continue;
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
      await createContactLocation(contactId, {
        location,
        kind: item.kind,
      });
    }

    // input.rawNote (untrimmed) is stored as this interaction's `notes` at
    // creation time, which lib/data.ts's createInteraction also copies
    // verbatim into the immutable `raw_notes` column -- that's what
    // preserves the original Quick Capture text exactly as submitted,
    // permanently, even if the interaction's notes are edited later.
    await createInteraction(contactId, {
      type: "other",
      occurredAt: new Date().toISOString(),
      summary: interactionSummary || trimmedRawNote.slice(0, 280) || "Quick Capture",
      notes: trimmedRawNote ? input.rawNote : undefined,
    });
  } catch (err) {
    // Best-effort rollback so a retry doesn't create a duplicate contact --
    // the FK `on delete cascade` on the child tables cleans up any partial
    // employment/education/location/interaction rows too.
    if (contactId) {
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
