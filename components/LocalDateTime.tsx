"use client";

import { useIsClient } from "@/lib/useIsClient";

// Formats an ISO timestamp in the viewer's browser timezone. Rendered on the
// client only: formatting during server rendering would use the server's
// timezone (UTC in production), not the viewer's.
const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };

export default function LocalDateTime({
  iso,
  options = DEFAULT_OPTIONS,
}: {
  iso: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  const isClient = useIsClient();

  return (
    <time dateTime={iso}>
      {isClient
        ? new Date(iso).toLocaleString(undefined, options)
        : null}
    </time>
  );
}
