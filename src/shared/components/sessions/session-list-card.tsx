import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SessionCardAccent = "warning" | "success" | "primary" | "muted" | "neutral";

export function sessionStatusAccent(status: string): SessionCardAccent {
  switch (status) {
    case "PENDING_APPROVAL":
      return "warning";
    case "IN_PROGRESS":
      return "success";
    case "APPROVED":
    case "ASSIGNED":
      return "primary";
    case "COMPLETED":
      return "muted";
    default:
      return "neutral";
  }
}

const ACCENT_BAR: Record<SessionCardAccent, string> = {
  warning: "bg-amber-500",
  success: "bg-emerald-500",
  primary: "bg-primary",
  muted: "bg-muted-foreground/35",
  neutral: "bg-transparent",
};

type SessionListCardProps = {
  accent?: SessionCardAccent;
  selected?: boolean;
  children: ReactNode;
  className?: string;
  "data-highlight-id"?: number | string;
};

export function SessionListCard({
  accent = "neutral",
  selected = false,
  children,
  className,
  "data-highlight-id": highlightId,
}: SessionListCardProps) {
  return (
    <article
      data-highlight-id={highlightId}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 bg-card p-4 ps-5 transition-colors",
        selected
          ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/40"
          : "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 start-0 w-1.5", ACCENT_BAR[accent])}
      />
      {children}
    </article>
  );
}
