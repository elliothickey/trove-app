import type { ExtractedContact } from "@/lib/ai/types";
import type { ContactLocationKind } from "@/lib/types";

const KIND_LABELS: Record<ContactLocationKind, string> = {
  hometown: "Hometown",
  current: "Current",
  previous: "Previous",
};

function formatRange(start?: string, end?: string, isCurrent?: boolean): string | undefined {
  if (!start && !end && !isCurrent) return undefined;
  const from = start ?? "?";
  const to = isCurrent ? "Present" : end ?? "?";
  return `${from} – ${to}`;
}

export default function ExtractionResult({ extracted }: { extracted: ExtractedContact }) {
  const hasAnything =
    extracted.name ||
    extracted.employment.length > 0 ||
    extracted.education.length > 0 ||
    extracted.locations.length > 0 ||
    extracted.interactionSummary ||
    extracted.notes;

  if (!hasAnything) {
    return (
      <p className="text-sm text-gray-500">
        The AI didn&apos;t find any extractable details in this note.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-medium text-gray-500">Extracted (review only — not saved)</h2>

      {extracted.name && (
        <div>
          <p className="text-xs font-medium text-gray-500">Name</p>
          <p className="text-sm text-gray-900">{extracted.name}</p>
        </div>
      )}

      {extracted.employment.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500">Employment</p>
          <ul className="space-y-2">
            {extracted.employment.map((item, index) => {
              const range = formatRange(item.startDate, item.endDate, item.isCurrent);
              return (
                <li key={index} className="rounded-lg border border-gray-200 p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900">{item.company}</span>
                    {item.isCurrent && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                        Current
                      </span>
                    )}
                  </div>
                  {item.role && <p className="text-gray-600">{item.role}</p>}
                  {range && <p className="mt-1 text-xs text-gray-500">{range}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {extracted.education.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500">Education</p>
          <ul className="space-y-2">
            {extracted.education.map((item, index) => {
              const subtitle = [item.degree, item.fieldOfStudy].filter(Boolean).join(", ");
              const range = formatRange(item.startDate, item.endDate);
              return (
                <li key={index} className="rounded-lg border border-gray-200 p-3 text-sm">
                  <p className="font-medium text-gray-900">{item.school}</p>
                  {subtitle && <p className="text-gray-600">{subtitle}</p>}
                  {range && <p className="mt-1 text-xs text-gray-500">{range}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {extracted.locations.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500">Locations</p>
          <ul className="space-y-2">
            {extracted.locations.map((item, index) => (
              <li
                key={index}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm"
              >
                {item.kind && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {KIND_LABELS[item.kind]}
                  </span>
                )}
                <span className="text-gray-900">{item.location}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {extracted.interactionSummary && (
        <div>
          <p className="text-xs font-medium text-gray-500">How you met / context</p>
          <p className="text-sm text-gray-900">{extracted.interactionSummary}</p>
        </div>
      )}

      {extracted.notes && (
        <div>
          <p className="text-xs font-medium text-gray-500">Other notes</p>
          <p className="whitespace-pre-wrap text-sm text-gray-900">{extracted.notes}</p>
        </div>
      )}
    </div>
  );
}
