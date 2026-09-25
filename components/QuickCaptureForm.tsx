"use client";

import { useActionState, useEffect, useRef } from "react";
import { unstable_rethrow } from "next/navigation";
import { extractQuickCaptureAction, type QuickCaptureState } from "@/app/quick-capture/actions";
import QuickCaptureReview from "@/components/QuickCaptureReview";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

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

  // Each extraction returns a new state object, so this runs once per
  // successful extraction -- never on initial load or after an error.
  useEffect(() => {
    if (state.status !== "success") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reviewRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }, [state]);

  return (
    <div>
      <form action={formAction}>
        <div className="rounded-card border border-line bg-surface shadow-xs transition-colors focus-within:border-line-strong focus-within:ring-3 focus-within:ring-ink/5">
          <label className="sr-only" htmlFor="note">
            Raw note
          </label>
          <textarea
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
            {/* Capture controls. A voice-capture control can sit beside the
                primary action here later. */}
            <div className="ml-auto flex items-center gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Extracting..." : "Extract details"}
              </Button>
            </div>
          </div>
        </div>
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
