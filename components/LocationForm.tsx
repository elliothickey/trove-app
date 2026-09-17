import Link from "next/link";
import type { ContactLocation, ContactLocationKind } from "@/lib/types";

const LOCATION_KIND_OPTIONS: { value: ContactLocationKind | ""; label: string }[] = [
  { value: "", label: "Unspecified" },
  { value: "hometown", label: "Hometown" },
  { value: "current", label: "Current" },
  { value: "previous", label: "Previous" },
];

type LocationFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  contactId: string;
  initialLocation?: ContactLocation;
};

export default function LocationForm({ action, contactId, initialLocation }: LocationFormProps) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="location">
          Location
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="e.g. Boston, MA"
          defaultValue={initialLocation?.location}
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
          defaultValue={initialLocation?.kind ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {LOCATION_KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
