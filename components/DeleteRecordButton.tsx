"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";

export default function DeleteRecordButton({
  action,
  confirmMessage,
}: {
  action: () => void | Promise<void>;
  confirmMessage: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function handleClick() {
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;
    setError(undefined);
    startTransition(async () => {
      try {
        await action();
      } catch (err) {
        // redirect() on a successful delete throws a framework control-flow
        // error -- let it propagate instead of reporting a false failure.
        unstable_rethrow(err);
        console.error(err);
        setError("Couldn't delete. Please try again.");
      }
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs font-medium text-ink-subtle transition-colors hover:text-danger disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </span>
  );
}
