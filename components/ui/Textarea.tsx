import type { ComponentProps } from "react";
import { cn } from "@/components/ui/cn";
import { controlStyles } from "@/components/ui/Input";

export default function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(controlStyles, "leading-relaxed", className)} {...props} />;
}
