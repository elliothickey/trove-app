import type { ComponentProps } from "react";
import { cn } from "@/components/ui/cn";

// Shared so links can look like cards:
// <Link className={cardStyles({ interactive: true })} />
export function cardStyles({
  interactive = false,
  className,
}: { interactive?: boolean; className?: string } = {}): string {
  return cn(
    "block rounded-card border border-line bg-surface",
    interactive && "transition-colors hover:border-line-strong hover:shadow-xs",
    className
  );
}

export default function Card({
  interactive,
  className,
  ...props
}: ComponentProps<"div"> & { interactive?: boolean }) {
  return <div className={cardStyles({ interactive, className })} {...props} />;
}
