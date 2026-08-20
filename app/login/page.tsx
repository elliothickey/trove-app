import { createClient } from "@/lib/supabase/server";
import { signInAction, signUpAction, signOutAction } from "@/app/login/actions";

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
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">Account</h1>
        <p className="text-sm text-gray-700">
          Signed in as <span className="font-medium">{user.email}</span>
        </p>
        <form action={signOutAction} className="mt-4">
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Sign in</h1>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {checkEmail && (
        <p className="mb-4 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Check your email to confirm your account before signing in.
        </p>
      )}

      <form action={signInAction} className="space-y-4">
        <Field label="Email" name="email" type="email" />
        <Field label="Password" name="password" type="password" />
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Sign in
          </button>
          <button
            type="submit"
            formAction={signUpAction}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Sign up
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
      />
    </div>
  );
}
