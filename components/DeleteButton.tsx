"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { deleteContactAction } from "@/app/actions";

export default function DeleteButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  function handleClick() {
    const confirmed = window.confirm(`Delete ${name}? This cannot be undone.`);
    if (!confirmed) return;
    setError(undefined);
    startTransition(async () => {
      try {
        await deleteContactAction(id);
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
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </span>
  );
}
