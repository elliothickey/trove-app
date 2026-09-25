import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signInAction, signUpAction, signOutAction } from "@/app/login/actions";
import Alert from "@/components/ui/Alert";
import Button, { buttonStyles } from "@/components/ui/Button";
import Field from "@/components/ui/Field";
import Input from "@/components/ui/Input";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkEmail?: string }>;
}) {
  const { error, checkEmail } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <main className="p-6 sm:p-8">
        <h1 className="text-xl font-semibold tracking-[-0.01em] text-ink">Account</h1>
        <p className="mt-2 break-words text-sm text-ink-muted">
          Signed in as <span className="font-medium text-ink">{user.email}</span>
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link href="/" className={buttonStyles()}>
            Go to People
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 sm:p-8">
      <h1 className="text-xl font-semibold tracking-[-0.01em] text-ink">Sign in</h1>
      <p className="mt-1 text-sm text-ink-muted">Welcome back to Trove.</p>

      {error && (
        <Alert tone="error" className="mt-5 break-words">
          {error}
        </Alert>
      )}
      {checkEmail && (
        <Alert tone="info" className="mt-5">
          Check your email to confirm your account before signing in.
        </Alert>
      )}

      <form action={signInAction} className="mt-6 space-y-4">
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" name="password" type="password" required />
        </Field>
        <Button type="submit" className="mt-2 w-full">
          Sign in
        </Button>
        <p className="pt-2 text-center text-[13px] text-ink-muted">
          New to Trove? Enter an email and password, then{" "}
          <button
            type="submit"
            formAction={signUpAction}
            className="rounded-sm font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
          >
            sign up
          </button>
          .
        </p>
      </form>
    </main>
  );
}
