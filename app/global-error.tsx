"use client";

import { useEffect } from "react";

// global-error replaces the root layout when active, so it must define its
// own <html>/<body> and cannot rely on app/globals.css or Tailwind classes --
// styling here is inline on purpose.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled global error:", error, "digest:", error.digest);
  }, [error]);

  // Trove's design tokens, inlined (see app/globals.css).
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: "#faf9f7",
          color: "#1c1b19",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 2rem",
              fontSize: "1.25rem",
              fontWeight: 600,
              letterSpacing: "-0.03em",
            }}
          >
            trove
          </p>
          <h1 style={{ fontSize: "1.125rem", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", lineHeight: 1.6, color: "#6b6863" }}>
            We hit an unexpected error. Please try again.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: "1.5rem",
              height: "2.25rem",
              borderRadius: "0.5rem",
              backgroundColor: "#1c1b19",
              color: "#fff",
              padding: "0 0.875rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
