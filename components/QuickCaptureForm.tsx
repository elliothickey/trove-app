"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { extractQuickCaptureAction, type QuickCaptureState } from "@/app/quick-capture/actions";
import QuickCaptureReview from "@/components/QuickCaptureReview";
import VoiceCaptureButton, { type VoiceMessage } from "@/components/VoiceCaptureButton";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";

const initialState: QuickCaptureState = { status: "idle" };

// Turns a thrown failure (e.g. a dropped network connection) into the same
// recoverable error state the server action returns, instead of letting it
// reach the error page and take the pasted note with it.
async function extractWithRecovery(
  prevState: QuickCaptureState,
  formData: FormData
): Promise<QuickCaptureState> {
  try {
    return await extractQuickCaptureAction(prevState, formData);
  } catch (err) {
    unstable_rethrow(err);
    console.error(err);
    return {
      status: "error",
      note: String(formData.get("note") ?? ""),
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export default function QuickCaptureForm() {
  const [state, formAction, isPending] = useActionState(extractWithRecovery, initialState);
  const reviewRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<VoiceMessage | null>(null);

  // Each extraction returns a new state object, so this runs once per
  // successful extraction -- never on initial load or after an error.
  useEffect(() => {
    if (state.status !== "success") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reviewRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [state]);

  // The note stays uncontrolled (see defaultValue below), so a transcript is
  // appended straight to its DOM value -- never replacing what's there --
  // and the existing FormData submission picks it up unchanged.
  function appendTranscript(text: string) {
    const textarea = noteRef.current;
    if (!textarea) return;
    const existing = textarea.value;
    const separator = existing === "" || /\s$/.test(existing) ? "" : " ";
    textarea.value = existing + separator + text;
    textarea.scrollTop = textarea.scrollHeight;
    // Focusing on touch devices would pop up the on-screen keyboard.
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      textarea.focus({ preventScroll: true });
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }

  return (
    <div>
      <form action={formAction}>
        <div className="rounded-card border border-line bg-surface shadow-xs transition-colors focus-within:border-line-strong focus-within:ring-3 focus-within:ring-ink/5">
          <label className="sr-only" htmlFor="note">
            Raw note
          </label>
          <textarea
            ref={noteRef}
            id="note"
            name="note"
            rows={7}
            required
            // React resets the form after every action, so on a failed
            // extraction put the submitted note back instead of clearing it.
            defaultValue={state.status === "error" ? state.note : undefined}
            placeholder="Met Sarah at a party through James. Brown junior from Hong Kong, interning at Evercore next summer. We talked about skiing."
            className="block min-h-44 w-full resize-y rounded-t-card bg-transparent px-5 pb-4 pt-5 text-base leading-7 sm:text-[15px] text-ink placeholder:text-ink-subtle focus:outline-none"
          />
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 sm:pl-5">
            <p className="hidden text-xs text-ink-subtle sm:block">
              No need to structure it. Names, places, plans, anything.
            </p>
            <div className="ml-auto flex items-center gap-2">
              {/* Voice only fills the note. It's locked while an extraction
                  is pending (the form reset would overwrite the transcript),
                  and Extract is locked while voice is busy. */}
              <VoiceCaptureButton
                disabled={isPending}
                onTranscript={appendTranscript}
                onBusyChange={setVoiceBusy}
                onMessageChange={setVoiceMessage}
              />
              <Button type="submit" disabled={isPending || voiceBusy}>
                {isPending ? "Extracting..." : "Extract details"}
              </Button>
            </div>
          </div>
        </div>
        {voiceMessage && (
          <p
            role={voiceMessage.tone === "error" ? "alert" : "status"}
            className={cn(
              "mt-2 px-1 text-xs leading-relaxed",
              voiceMessage.tone === "error" ? "text-danger" : "text-ink-muted"
            )}
          >
            {voiceMessage.text}
          </p>
        )}
      </form>

      {state.status === "error" && (
        <Alert tone="error" className="mt-4">
          {state.error}
        </Alert>
      )}

      {state.status === "success" && (
        <div ref={reviewRef} className="mt-12 scroll-mt-20">
          <QuickCaptureReview key={state.note} extracted={state.extracted} rawNote={state.note} />
        </div>
      )}
    </div>
  );
}
