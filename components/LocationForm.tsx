"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionFormState } from "@/app/actions";
import type { ContactLocation, ContactLocationKind } from "@/lib/types";

const LOCATION_KIND_OPTIONS: { value: ContactLocationKind | ""; label: string }[] = [
  { value: "", label: "Unspecified" },
  { value: "hometown", label: "Hometown" },
  { value: "current", label: "Current" },
  { value: "previous", label: "Previous" },
];

type LocationFormProps = {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  contactId: string;
  initialLocation?: ContactLocation;
};

const initialState: ActionFormState = {};

export default function LocationForm({ action, contactId, initialLocation }: LocationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="e.g. Boston, MA"
          defaultValue={state.values?.location ?? initialLocation?.location}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="kind">
          Type
        </label>
        <select
          id="kind"
          name="kind"
          defaultValue={state.values?.kind ?? initialLocation?.kind ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {LOCATION_KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
