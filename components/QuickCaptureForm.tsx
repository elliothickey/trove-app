"use client";

import { useActionState } from "react";
import { unstable_rethrow } from "next/navigation";
import { extractQuickCaptureAction, type QuickCaptureState } from "@/app/quick-capture/actions";
import QuickCaptureReview from "@/components/QuickCaptureReview";

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

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="note">
            Raw note
          </label>
          <textarea
            id="note"
            name="note"
            rows={8}
            required
            // React resets the form after every action, so on a failed
            // extraction put the submitted note back instead of clearing it.
            defaultValue={state.status === "error" ? state.note : undefined}
            placeholder="e.g. Met Sarah Chen at a party through James. She's a Brown junior from Hong Kong studying economics. She's interning at Evercore next summer. We talked about skiing."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? "Extracting..." : "Extract with AI"}
        </button>
      </form>

      {state.status === "error" && (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {state.status === "success" && (
        <div className="space-y-5">
          <div>
            <h2 className="mb-1 text-sm font-medium text-gray-500">Original note</h2>
            <p className="whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900">
              {state.note}
            </p>
          </div>
          <QuickCaptureReview key={state.note} extracted={state.extracted} rawNote={state.note} />
        </div>
      )}
    </div>
  );
}
