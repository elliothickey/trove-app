import Link from "next/link";
import type { ContactEducation } from "@/lib/types";
import { deleteEducationAction } from "@/app/actions";
import DeleteRecordButton from "@/components/DeleteRecordButton";

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

function formatDates(education: ContactEducation): string | undefined {
  const start = displayDate(education.startDate, education.startDateText);
  const end = displayDate(education.endDate, education.endDateText);
  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) {
    return `Since ${start}`;
  }
  if (end) {
    return `Until ${end}`;
  }
  return undefined;
}

export default function EducationList({
  contactId,
  education,
}: {
  contactId: string;
  education: ContactEducation[];
}) {
  if (education.length === 0) {
    return <p className="text-sm text-gray-500">No education added yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {education.map((item) => {
        const dates = formatDates(item);
        const subtitle = [item.degree, item.fieldOfStudy].filter(Boolean).join(", ");
        return (
          <li key={item.id} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.school}</p>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                {dates && <p className="mt-1 text-xs text-gray-500">{dates}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/contacts/${contactId}/education/${item.id}/edit`}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Edit
                </Link>
                <DeleteRecordButton
                  action={deleteEducationAction.bind(null, contactId, item.id)}
                  confirmMessage="Delete this education record? This cannot be undone."
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
