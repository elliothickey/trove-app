import Link from "next/link";
import type { ContactEmployment } from "@/lib/types";
import { deleteEmploymentAction } from "@/app/actions";
import DeleteRecordButton from "@/components/DeleteRecordButton";
import {
  ProfileEmpty,
  recordControlsStyles,
  recordEditLinkStyles,
} from "@/components/ProfileSection";
import Tag from "@/components/ui/Tag";

function formatMonthYear(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

// Falls back to the "as written" text (e.g. from Quick Capture) when there's
// no exact date to format -- never silently drops a date the user provided.
function displayDate(exact: string | undefined, text: string | undefined): string | undefined {
  return exact ? formatMonthYear(exact) : text;
}

function formatDates(employment: ContactEmployment): string | undefined {
  const { isCurrent } = employment;
  const start = displayDate(employment.startDate, employment.startDateText);
  const end = displayDate(employment.endDate, employment.endDateText);
  if (isCurrent) {
    return start ? `${start} – Present` : "Present";
  }
  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) {
    return start;
  }
  if (end) {
    return `Until ${end}`;
  }
  return undefined;
}

export default function EmploymentList({
  contactId,
  employment,
}: {
  contactId: string;
  employment: ContactEmployment[];
}) {
  if (employment.length === 0) {
    return <ProfileEmpty>No employment added yet.</ProfileEmpty>;
  }

  return (
    <ul className="space-y-4">
      {employment.map((item) => {
        const dates = formatDates(item);
        return (
          <li key={item.id} className="group">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-medium text-ink">{item.company}</p>
                  {item.isCurrent && <Tag>Current</Tag>}
                </div>
                {item.role && <p className="mt-0.5 text-[13px] text-ink-muted">{item.role}</p>}
                {dates && <p className="mt-0.5 text-xs text-ink-subtle">{dates}</p>}
              </div>
              <div className={recordControlsStyles}>
                <Link
                  href={`/contacts/${contactId}/employment/${item.id}/edit`}
                  className={recordEditLinkStyles}
                >
                  Edit
                </Link>
                <DeleteRecordButton
                  action={deleteEmploymentAction.bind(null, contactId, item.id)}
                  confirmMessage="Delete this employment record? This cannot be undone."
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
