import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type AlertTone = "error" | "info" | "success";

const TONES: Record<AlertTone, string> = {
  error: "border-danger-line bg-danger-soft text-danger",
  info: "border-info-line bg-info-soft text-info",
  success: "border-success-line bg-success-soft text-success",
};

export default function Alert({
  tone = "info",
  className,
  children,
}: {
  tone?: AlertTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-control border px-4 py-3 text-sm leading-relaxed", TONES[tone], className)}
    >
      {children}
    </div>
  );
}
