import type { ComponentProps } from "react";
import { cn } from "@/components/ui/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white shadow-xs hover:bg-ink/85",
  secondary:
    "border border-line-strong bg-surface text-ink shadow-xs hover:border-ink-subtle/60 hover:bg-sunken/60",
  ghost: "text-ink-muted hover:bg-sunken hover:text-ink",
  danger: "border border-danger-line bg-surface text-danger hover:bg-danger-soft",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-9 gap-2 px-3.5 text-sm",
};

// Shared so links can look like buttons:
// <Link className={buttonStyles({ variant: "secondary" })} />
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-control font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

export default function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}
