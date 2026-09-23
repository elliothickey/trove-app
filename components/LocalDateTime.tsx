"use client";

import { useIsClient } from "@/lib/useIsClient";

// Formats an ISO timestamp in the viewer's browser timezone. Rendered on the
// client only: formatting during server rendering would use the server's
// timezone (UTC in production), not the viewer's.
export default function LocalDateTime({ iso }: { iso: string }) {
  const isClient = useIsClient();

  return (
    <time dateTime={iso}>
      {isClient
        ? new Date(iso).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : null}
    </time>
  );
}
