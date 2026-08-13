"use client";

import { useTransition } from "react";
import { deleteInteractionAction } from "@/app/actions";

export default function DeleteInteractionButton({
  contactId,
  interactionId,
}: {
  contactId: string;
  interactionId: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm("Delete this interaction? This cannot be undone.");
    if (!confirmed) return;
    startTransition(() => {
      deleteInteractionAction(contactId, interactionId);
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
