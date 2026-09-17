import Link from "next/link";
import type { ContactEducation } from "@/lib/types";

type EducationFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  contactId: string;
  initialEducation?: ContactEducation;
};

export default function EducationForm({ action, contactId, initialEducation }: EducationFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="school">
          School
        </label>
        <input
          id="school"
          name="school"
          type="text"
          defaultValue={initialEducation?.school}
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
          defaultValue={initialEducation?.degree}
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
          defaultValue={initialEducation?.fieldOfStudy}
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
            defaultValue={initialEducation?.startDate}
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
            defaultValue={initialEducation?.endDate}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>
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
