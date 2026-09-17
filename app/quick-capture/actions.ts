"use server";

import { createClient } from "@/lib/supabase/server";
import { extractContactFromNote, ExtractionError } from "@/lib/ai/extractContact";
import type { ExtractedContact } from "@/lib/ai/types";

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
