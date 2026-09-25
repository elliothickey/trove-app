import type { ReactNode } from "react";
import Link from "next/link";
import { PlusIcon } from "@/components/ui/icons";

// Record controls (Edit/Delete) stay out of the way on hover-capable
// devices until their row is hovered or focused, and stay visible on touch
// screens or while a delete error is showing.
export const recordControlsStyles =
  "flex shrink-0 items-center gap-3 transition-opacity [@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-within:opacity-100 has-[p]:opacity-100";

export const recordEditLinkStyles =
  "rounded-sm text-xs font-medium text-ink-subtle transition-colors hover:text-ink";

export default function ProfileSection({
  title,
  addHref,
  addLabel,
  children,
}: {
  title: string;
  addHref?: string;
  addLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-2.5 flex items-center justify-between gap-3 sm:mb-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.06em] text-ink-subtle">{title}</h2>
        {addHref && (
          <Link
            href={addHref}
            aria-label={addLabel}
            title={addLabel}
            className="-mr-1 flex size-6 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-sunken hover:text-ink"
          >
            <PlusIcon className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function ProfileEmpty({ children }: { children: ReactNode }) {
  return <p className="text-[13px] text-ink-subtle">{children}</p>;
}
