import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export default function EmptyState({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-line-strong px-6 py-14 text-center",
        className
      )}
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}
