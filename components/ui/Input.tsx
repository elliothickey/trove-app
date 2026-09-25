import type { ComponentProps } from "react";
import { cn } from "@/components/ui/cn";

// Shared by Input, Textarea and Select. Text is 16px on phones so iOS
// doesn't zoom the page when a field is focused.
export const controlStyles =
  "block w-full rounded-control border border-line-strong bg-surface px-3 py-2 text-base text-ink shadow-xs transition-colors placeholder:text-ink-subtle focus:border-ink-subtle focus:outline-none focus:ring-3 focus:ring-ink/8 disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-subtle sm:text-sm";

// Single-line control height: a touch taller on phones.
export const controlHeight = "h-10 sm:h-9";

export default function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(controlStyles, controlHeight, className)} {...props} />;
}
