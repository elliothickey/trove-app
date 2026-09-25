import Link from "next/link";
import type { ContactListItem } from "@/lib/types";
import Avatar from "@/components/ui/Avatar";
import { cardStyles } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { ChevronRightIcon } from "@/components/ui/icons";
import Tag from "@/components/ui/Tag";

// resolveContactSubtitle's fallback when a contact has nothing to show.
const EMPTY_SUBTITLE = "No details yet";

export default function ContactCard({ contact }: { contact: ContactListItem }) {
  const hasDetails = contact.subtitle !== EMPTY_SUBTITLE;

  return (
    <Link
      href={`/contacts/${contact.id}`}
      className={cardStyles({
        interactive: true,
        className: "group flex h-full items-start gap-3.5 p-4 sm:p-5",
      })}
    >
      <Avatar name={contact.name} seed={contact.id} />
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate text-[15px] font-medium leading-5 tracking-[-0.01em] text-ink">
          {contact.name}
        </p>
        <p
          className={cn(
            "mt-1 truncate text-[13px] leading-5",
            hasDetails ? "text-ink-muted" : "text-ink-subtle"
          )}
        >
          {contact.subtitle}
        </p>
        {contact.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {contact.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
      </div>
      <ChevronRightIcon className="mt-3 size-4 shrink-0 text-line-strong transition group-hover:translate-x-0.5 group-hover:text-ink-muted" />
    </Link>
  );
}
