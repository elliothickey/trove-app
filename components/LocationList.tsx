import Link from "next/link";
import type { ContactLocation, ContactLocationKind } from "@/lib/types";
import { deleteLocationAction } from "@/app/actions";
import DeleteRecordButton from "@/components/DeleteRecordButton";

const KIND_LABELS: Record<ContactLocationKind, string> = {
  hometown: "Hometown",
  current: "Current",
  previous: "Previous",
};

export default function LocationList({
  contactId,
  locations,
}: {
  contactId: string;
  locations: ContactLocation[];
}) {
  if (locations.length === 0) {
    return <p className="text-sm text-gray-500">No locations added yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {locations.map((item) => (
        <li key={item.id} className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {item.kind && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                  {KIND_LABELS[item.kind]}
                </span>
              )}
              <p className="text-sm font-medium text-gray-900">{item.location}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/contacts/${contactId}/locations/${item.id}/edit`}
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Edit
              </Link>
              <DeleteRecordButton
                action={deleteLocationAction.bind(null, contactId, item.id)}
                confirmMessage="Delete this location? This cannot be undone."
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
