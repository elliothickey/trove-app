"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ActionFormState } from "@/app/actions";
import type { ContactEducation } from "@/lib/types";

type EducationFormProps = {
  action: (prevState: ActionFormState, formData: FormData) => Promise<ActionFormState>;
  contactId: string;
  initialEducation?: ContactEducation;
};

const initialState: ActionFormState = {};

export default function EducationForm({ action, contactId, initialEducation }: EducationFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {/* Carries through an "as written" date (e.g. from Quick Capture) that
          has no exact date yet, so a routine edit here doesn't silently wipe
          it. parseEducationInput() only keeps this value when the matching
          exact date field below is left blank. */}
      <input type="hidden" name="startDateText" value={initialEducation?.startDateText ?? ""} />
      <input type="hidden" name="endDateText" value={initialEducation?.endDateText ?? ""} />
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="school">
          School
        </label>
        <input
          id="school"
          name="school"
          type="text"
          defaultValue={state.values?.school ?? initialEducation?.school}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="degree">
          Degree
        </label>
        <input
          id="degree"
          name="degree"
          type="text"
          placeholder="e.g. B.A."
          defaultValue={state.values?.degree ?? initialEducation?.degree}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="fieldOfStudy">
          Field of study
        </label>
        <input
          id="fieldOfStudy"
          name="fieldOfStudy"
          type="text"
          defaultValue={state.values?.fieldOfStudy ?? initialEducation?.fieldOfStudy}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="startDate">
            Start date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={state.values?.startDate ?? initialEducation?.startDate}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="endDate">
            End date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={state.values?.endDate ?? initialEducation?.endDate}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
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
