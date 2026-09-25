import Link from "next/link";
import type { ContactLocation, ContactLocationKind } from "@/lib/types";
import { deleteLocationAction } from "@/app/actions";
import DeleteRecordButton from "@/components/DeleteRecordButton";
import {
  ProfileEmpty,
  recordControlsStyles,
  recordEditLinkStyles,
} from "@/components/ProfileSection";
import Tag from "@/components/ui/Tag";

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
    return <ProfileEmpty>No locations added yet.</ProfileEmpty>;
  }

  return (
    <ul className="space-y-3">
      {locations.map((item) => (
        <li key={item.id} className="group">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-medium text-ink">{item.location}</p>
              {item.kind && <Tag>{KIND_LABELS[item.kind]}</Tag>}
            </div>
            <div className={recordControlsStyles}>
              <Link
                href={`/contacts/${contactId}/locations/${item.id}/edit`}
                className={recordEditLinkStyles}
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
