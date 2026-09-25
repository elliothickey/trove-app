import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/login/actions";
import ShellFrame from "@/components/shell/ShellFrame";
import { MobileNav, SidebarNav } from "@/components/shell/PrimaryNav";

function Wordmark({ className = "text-[17px]" }: { className?: string }) {
  return (
    <Link href="/" className={`rounded-sm font-semibold tracking-[-0.03em] text-ink ${className}`}>
      trove
    </Link>
  );
}

function Avatar({ email }: { email: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-line bg-sunken text-[11px] font-medium uppercase text-ink-muted"
    >
      {email.charAt(0)}
    </span>
  );
}

function SignOutButton({ className }: { className: string }) {
  return (
    <form action={signOutAction}>
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}

export default async function AppShell({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-out pages (just /login, given the proxy redirect) render bare.
  if (!user) {
    return <>{children}</>;
  }

  const email = user.email ?? "";

  const sidebar = (
    <div className="flex h-full flex-col px-3 pb-4 pt-6">
      <div className="px-3">
        <Wordmark />
      </div>

      <SidebarNav />

      <div className="mt-auto border-t border-line pt-4">
        <div className="flex items-center gap-2.5 px-3" title={email}>
          <Avatar email={email} />
          <span className="min-w-0 truncate text-[13px] text-ink-muted">{email}</span>
        </div>
        <div className="mt-2">
          <SignOutButton className="flex h-8 w-full items-center rounded-control px-3 text-[13px] text-ink-muted transition-colors hover:bg-sunken hover:text-ink" />
        </div>
      </div>
    </div>
  );

  const mobileHeader = (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas md:hidden">
      <div className="flex h-12 items-center gap-1 px-3">
        <Wordmark className="px-1 text-base" />
        <MobileNav />
        <details className="relative">
          <summary
            aria-label="Account"
            className="flex size-9 cursor-pointer list-none items-center justify-center rounded-control hover:bg-sunken [&::-webkit-details-marker]:hidden"
          >
            <Avatar email={email} />
          </summary>
          <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-card border border-line bg-surface p-1.5 shadow-sm">
            <p className="truncate px-2.5 py-2 text-[13px] text-ink-muted">{email}</p>
            <SignOutButton className="flex h-8 w-full items-center rounded-control px-2.5 text-[13px] text-ink hover:bg-sunken" />
          </div>
        </details>
      </div>
    </header>
  );

  return (
    <ShellFrame sidebar={sidebar} mobileHeader={mobileHeader}>
      {children}
    </ShellFrame>
  );
}
