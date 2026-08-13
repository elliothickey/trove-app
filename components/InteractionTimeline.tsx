import Link from "next/link";
import type { Interaction, InteractionType } from "@/lib/types";
import DeleteInteractionButton from "@/components/DeleteInteractionButton";

const TYPE_LABELS: Record<InteractionType, string> = {
  meeting: "Meeting",
  call: "Call",
  email: "Email",
  message: "Message",
  other: "Other",
};

function formatOccurredAt(isoString: string): string {
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function InteractionTimeline({
  contactId,
  interactions,
}: {
  contactId: string;
  interactions: Interaction[];
}) {
  if (interactions.length === 0) {
    return <p className="text-sm text-gray-500">No interactions logged yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {interactions.map((interaction) => (
        <li
          key={interaction.id}
          className="rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                  {TYPE_LABELS[interaction.type]}
                </span>
                <span>{formatOccurredAt(interaction.occurredAt)}</span>
                {interaction.location && <span>&middot; {interaction.location}</span>}
              </div>
              <p className="mt-1 text-sm font-medium text-gray-900">{interaction.summary}</p>
              {interaction.notes && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">
                  {interaction.notes}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/contacts/${contactId}/interactions/${interaction.id}/edit`}
                className="text-xs font-medium text-gray-600 hover:text-gray-900"
              >
                Edit
              </Link>
              <DeleteInteractionButton
                contactId={contactId}
                interactionId={interaction.id}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
