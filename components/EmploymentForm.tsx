"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContactEmployment } from "@/lib/types";

type EmploymentFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  contactId: string;
  initialEmployment?: ContactEmployment;
};

export default function EmploymentForm({
  action,
  contactId,
  initialEmployment,
}: EmploymentFormProps) {
  const [isCurrent, setIsCurrent] = useState(initialEmployment?.isCurrent ?? false);
  const [endDate, setEndDate] = useState(initialEmployment?.endDate ?? "");

  return (
    <form action={action} className="space-y-4">
      {/* Carries through an "as written" date (e.g. from Quick Capture) that
          has no exact date yet, so a routine edit here doesn't silently wipe
          it. parseEmploymentInput() only keeps this value when the matching
          exact date field above is left blank. */}
      <input type="hidden" name="startDateText" value={initialEmployment?.startDateText ?? ""} />
      <input type="hidden" name="endDateText" value={initialEmployment?.endDateText ?? ""} />
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="company">
          Company
        </label>
        <input
          id="company"
          name="company"
          type="text"
          defaultValue={initialEmployment?.company}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="role">
          Role
        </label>
        <input
          id="role"
          name="role"
          type="text"
          defaultValue={initialEmployment?.role}
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
            defaultValue={initialEmployment?.startDate}
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
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isCurrent}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isCurrent"
          name="isCurrent"
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => {
            setIsCurrent(e.target.checked);
            if (e.target.checked) {
              setEndDate("");
            }
          }}
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-400"
        />
        <label className="text-sm text-gray-700" htmlFor="isCurrent">
          This is their current job
        </label>
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
