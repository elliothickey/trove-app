import type { ComponentProps } from "react";
import { cn } from "@/components/ui/cn";
import { controlHeight, controlStyles } from "@/components/ui/Input";

export default function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(controlStyles, controlHeight, "py-0", className)} {...props} />;
}
