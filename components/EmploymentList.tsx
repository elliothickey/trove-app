import Link from "next/link";
import type { ContactEmployment } from "@/lib/types";
import { deleteEmploymentAction } from "@/app/actions";
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
    return <p className="text-sm text-gray-500">No employment added yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {employment.map((item) => {
        const dates = formatDates(item);
        return (
          <li key={item.id} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{item.company}</p>
                  {item.isCurrent && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      Current
                    </span>
                  )}
                </div>
                {item.role && <p className="text-sm text-gray-600">{item.role}</p>}
                {dates && <p className="mt-1 text-xs text-gray-500">{dates}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/contacts/${contactId}/employment/${item.id}/edit`}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900"
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
