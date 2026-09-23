import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/login/actions";

export default async function AppHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 text-sm font-semibold text-gray-900">
          Personal CRM
        </Link>
        {user && (
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/quick-capture"
              className="shrink-0 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Quick Capture
            </Link>
            {/* Hidden on phone widths, where it doesn't fit; still shown on
                the /login account page. */}
            <span className="hidden min-w-0 truncate text-sm text-gray-500 sm:inline">
              {user.email}
            </span>
            <form action={signOutAction} className="shrink-0">
              <button
                type="submit"
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
