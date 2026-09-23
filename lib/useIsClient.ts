"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

// False during server rendering and hydration, true once running in the
// browser. Lets components that depend on the viewer's timezone render
// nothing timezone-specific on the server (which may be UTC) and fill in the
// browser-local value right after hydration, without a hydration mismatch.
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
