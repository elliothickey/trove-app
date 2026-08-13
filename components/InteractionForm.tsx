import Link from "next/link";
import type { Interaction, InteractionType } from "@/lib/types";

const INTERACTION_TYPE_OPTIONS: { value: InteractionType; label: string }[] = [
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "message", label: "Message" },
  { value: "other", label: "Other" },
];

type InteractionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  contactId: string;
  initialInteraction?: Interaction;
};

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
  const defaultOccurredAt = initialInteraction
    ? toDatetimeLocalValue(initialInteraction.occurredAt)
    : toDatetimeLocalValue(new Date().toISOString());

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="type">
          Type
        </label>
        <select
          id="type"
          name="type"
          defaultValue={initialInteraction?.type ?? "meeting"}
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
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="occurredAt">
          Date &amp; time
        </label>
        <input
          id="occurredAt"
          name="occurredAt"
          type="datetime-local"
          defaultValue={defaultOccurredAt}
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
          defaultValue={initialInteraction?.location}
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
          defaultValue={initialInteraction?.summary}
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
          defaultValue={initialInteraction?.notes}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Save
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
