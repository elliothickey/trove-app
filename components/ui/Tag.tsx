import type { ComponentProps } from "react";
import { cn } from "@/components/ui/cn";

export default function Tag({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-line bg-sunken px-1.5 py-0.5 text-xs leading-4 text-ink-muted",
        className
      )}
      {...props}
    />
  );
}
