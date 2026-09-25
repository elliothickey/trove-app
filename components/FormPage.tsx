import type { ReactNode } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";

// Shared frame for the add/edit pages: a quiet back link, the title, and the
// form on a single card at a readable width.
export default function FormPage({
  title,
  backHref,
  backLabel,
  children,
}: {
  title: string;
  backHref: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-5 sm:px-8 sm:py-10">
      <Link
        href={backHref}
        className="rounded-sm text-[13px] text-ink-muted transition-colors hover:text-ink"
      >
        &larr; {backLabel}
      </Link>
      <PageHeader title={title} className="mb-5 mt-4 sm:mb-6 sm:mt-6" />
      <Card className="p-5 sm:p-6">{children}</Card>
    </main>
  );
}
