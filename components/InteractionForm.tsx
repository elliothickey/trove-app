"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionFormState } from "@/app/actions";
import type { Interaction, InteractionType } from "@/lib/types";
import { useIsClient } from "@/lib/useIsClient";

const INTERACTION_TYPE_OPTIONS: { value: InteractionType; label: string }[] = [
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "message", label: "Message" },
  { value: "other", label: "Other" },
];

type InteractionFormProps = {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  contactId: string;
  initialInteraction?: Interaction;
};

const initialState: ActionFormState = {};

// Browser-local "YYYY-MM-DDTHH:mm" for a datetime-local input. Must only run
// in the browser: on the server it would use the server's timezone.
function toDatetimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function InteractionForm({
  action,
  contactId,
  initialInteraction,
}: InteractionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isClient = useIsClient();

  const initialOccurredAtLocal = initialInteraction
    ? toDatetimeLocalValue(initialInteraction.occurredAt)
    : undefined;
  const defaultOccurredAtLocal = isClient
    ? (state.values?.occurredAtLocal ??
      initialOccurredAtLocal ??
      toDatetimeLocalValue(new Date().toISOString()))
    : undefined;

  // The datetime-local input's value has no timezone, and the server may not
  // share the user's timezone -- so convert it to an unambiguous ISO instant
  // here in the browser, where it's interpreted in the user's local time,
  // before the form reaches the server action.
  function submit(formData: FormData) {
    const local = String(formData.get("occurredAtLocal") ?? "");
    if (initialInteraction && local === initialOccurredAtLocal) {
      // Date/time left unchanged: keep the stored instant exactly, including
      // any seconds the minute-precision input can't show.
      formData.set("occurredAt", initialInteraction.occurredAt);
    } else {
      const date = new Date(local);
      if (!Number.isNaN(date.getTime())) {
        formData.set("occurredAt", date.toISOString());
      }
    }
    formAction(formData);
  }

  return (
    <form action={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="type">
          Type
        </label>
        <select
          id="type"
          name="type"
          defaultValue={state.values?.type ?? initialInteraction?.type ?? "meeting"}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {INTERACTION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="occurredAtLocal">
          Date &amp; time
        </label>
        {/* Keyed on isClient so it remounts with the browser-local default
            once hydrated; the server render stays empty and disabled. */}
        <input
          key={isClient ? "client" : "server"}
          id="occurredAtLocal"
          name="occurredAtLocal"
          type="datetime-local"
          defaultValue={defaultOccurredAtLocal}
          disabled={!isClient}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="e.g. Zoom, Brown campus, McKinsey office"
          defaultValue={state.values?.location ?? initialInteraction?.location}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="summary">
          Summary
        </label>
        <input
          id="summary"
          name="summary"
          type="text"
          placeholder="e.g. Coffee to catch up before her move"
          defaultValue={state.values?.summary ?? initialInteraction?.summary}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={state.values?.notes ?? initialInteraction?.notes}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {state.error && (
        <p className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <Link
          href={`/contacts/${contactId}`}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
