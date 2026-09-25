import type { ReactNode } from "react";
import Link from "next/link";

// Standalone layout: /login never shows the signed-in app shell.
export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 pb-16 pt-12 sm:pt-24">
      <Link
        href="/"
        className="mb-8 rounded-sm text-xl font-semibold tracking-[-0.03em] text-ink"
      >
        trove
      </Link>
      <div className="w-full max-w-sm rounded-card border border-line bg-surface shadow-xs">
        {children}
      </div>
    </div>
  );
}
