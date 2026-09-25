"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { CaptureIcon, PeopleIcon } from "@/components/ui/icons";

function useActiveSection() {
  const pathname = usePathname();
  return {
    people: pathname === "/" || pathname.startsWith("/contacts"),
    quickCapture: pathname.startsWith("/quick-capture"),
  };
}

export function SidebarNav() {
  const active = useActiveSection();

  return (
    <nav aria-label="Primary" className="mt-8 flex flex-col gap-6">
      <Link
        href="/quick-capture"
        aria-current={active.quickCapture ? "page" : undefined}
        className={cn(
          "flex h-9 items-center gap-2.5 rounded-control border bg-surface px-3 text-sm font-medium text-ink shadow-xs transition-colors",
          active.quickCapture
            ? "border-ink-subtle/70 ring-3 ring-ink/5"
            : "border-line-strong hover:border-ink-subtle/60"
        )}
      >
        <CaptureIcon />
        Quick Capture
      </Link>

      <ul className="flex flex-col gap-0.5">
        <li>
          <Link
            href="/"
            aria-current={active.people ? "page" : undefined}
            className={cn(
              "flex h-8 items-center gap-2.5 rounded-control px-3 text-sm transition-colors",
              active.people
                ? "bg-sunken font-medium text-ink"
                : "text-ink-muted hover:bg-sunken/70 hover:text-ink"
            )}
          >
            <PeopleIcon />
            People
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export function MobileNav() {
  const active = useActiveSection();

  return (
    <nav aria-label="Primary" className="ml-auto flex items-center gap-0.5">
      <Link
        href="/"
        aria-current={active.people ? "page" : undefined}
        className={cn(
          "flex h-8 items-center rounded-control px-2 text-[13px] transition-colors",
          active.people ? "bg-sunken font-medium text-ink" : "text-ink-muted hover:text-ink"
        )}
      >
        People
      </Link>
      <Link
        href="/quick-capture"
        aria-current={active.quickCapture ? "page" : undefined}
        className={cn(
          "ml-1 flex h-8 items-center gap-1 rounded-control border bg-surface px-2 text-xs font-medium text-ink shadow-xs transition-colors",
          active.quickCapture ? "border-ink-subtle/70" : "border-line-strong hover:border-ink-subtle/60"
        )}
      >
        <CaptureIcon className="size-3.5" />
        Quick Capture
      </Link>
    </nav>
  );
}
