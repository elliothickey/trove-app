"use client";

import { useTransition } from "react";

export default function DeleteRecordButton({
  action,
  confirmMessage,
}: {
  action: () => void | Promise<void>;
  confirmMessage: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;
    startTransition(() => {
      action();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
