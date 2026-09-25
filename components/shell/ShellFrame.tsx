"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

// /login gets its own standalone layout, so the signed-in chrome is dropped
// there even when a user is signed in (the account page).
export default function ShellFrame({
  sidebar,
  mobileHeader,
  children,
}: {
  sidebar: ReactNode;
  mobileHeader: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-line md:block">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {mobileHeader}
        {children}
      </div>
    </div>
  );
}
