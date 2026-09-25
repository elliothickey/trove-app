import Link from "next/link";
import type { Interaction, InteractionType } from "@/lib/types";
import DeleteInteractionButton from "@/components/DeleteInteractionButton";
import LocalDateTime from "@/components/LocalDateTime";
import { recordControlsStyles, recordEditLinkStyles } from "@/components/ProfileSection";
import { ChevronRightIcon } from "@/components/ui/icons";
import Tag from "@/components/ui/Tag";

const TYPE_LABELS: Record<InteractionType, string> = {
  meeting: "Meeting",
  call: "Call",
  email: "Email",
  message: "Message",
  other: "Other",
};

export default function InteractionTimeline({
  contactId,
  interactions,
}: {
  contactId: string;
  interactions: Interaction[];
}) {
  if (interactions.length === 0) {
    return <p className="text-sm text-ink-subtle">No interactions logged yet.</p>;
  }

  // Interactions arrive newest first; the rail reads top-down through time.
  return (
    <ol>
      {interactions.map((interaction, index) => (
        <li key={interaction.id} className="group relative flex gap-3 pb-6 last:pb-0 sm:gap-4 sm:pb-8">
          {/* Rail: a dot per interaction, joined by a line to the next one. */}
          <div aria-hidden="true" className="relative flex w-3 shrink-0 justify-center">
            <span
              className={
                index === 0
                  ? "relative z-10 mt-1.5 size-2.5 rounded-full bg-ink ring-4 ring-canvas"
                  : "relative z-10 mt-1.5 size-2.5 rounded-full border-2 border-ink-subtle bg-canvas ring-4 ring-canvas"
              }
            />
            {index < interactions.length - 1 && (
              <span className="absolute -bottom-7 top-4 w-px bg-line-strong sm:-bottom-9" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-[13px]">
                <span className="font-medium text-ink">
                  <LocalDateTime iso={interaction.occurredAt} options={{ dateStyle: "medium" }} />
                </span>
                <span className="text-ink-subtle">
                  <LocalDateTime iso={interaction.occurredAt} options={{ timeStyle: "short" }} />
                </span>
                <Tag>{TYPE_LABELS[interaction.type]}</Tag>
                {interaction.location && (
                  <span className="text-ink-muted">&middot; {interaction.location}</span>
                )}
              </div>
              <div className={recordControlsStyles}>
                <Link
                  href={`/contacts/${contactId}/interactions/${interaction.id}/edit`}
                  className={recordEditLinkStyles}
                >
                  Edit
                </Link>
                <DeleteInteractionButton
                  contactId={contactId}
                  interactionId={interaction.id}
                />
              </div>
            </div>

            <p className="mt-1.5 break-words text-sm leading-relaxed text-ink sm:mt-2 sm:text-[15px]">
              {interaction.summary}
            </p>
            {interaction.notes && (
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink-muted">
                {interaction.notes}
              </p>
            )}
            {interaction.rawNotes && (
              <details className="group/raw mt-3">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm py-1 text-xs font-medium sm:py-0 text-ink-subtle transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
                  <ChevronRightIcon className="size-3.5 transition-transform group-open/raw:rotate-90" />
                  Original note
                </summary>
                <p className="mt-2 whitespace-pre-wrap break-words rounded-control bg-sunken px-3 py-2.5 text-[13px] leading-relaxed text-ink-muted sm:px-4 sm:py-3 sm:text-sm">
                  {interaction.rawNotes}
                </p>
              </details>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
