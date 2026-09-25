"use client";

import { useEffect } from "react";
import Link from "next/link";
import Button, { buttonStyles } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error boundary:", error, "digest:", error.digest);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-lg font-semibold tracking-[-0.01em] text-ink">Something went wrong</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        We hit an unexpected error. Please try again.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => unstable_retry()}>Try again</Button>
        <Link href="/" className={buttonStyles({ variant: "ghost" })}>
          Back to People
        </Link>
      </div>
    </main>
  );
}
