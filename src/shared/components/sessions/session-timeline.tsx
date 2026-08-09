"use client";

import { cn } from "@/lib/utils";

export type SessionTimelineStep = {
  key: string;
  label: string;
  value?: string | null;
};

type SessionTimelineProps = {
  steps: SessionTimelineStep[];
  className?: string;
};

/** Formats API date/datetime for display; returns null if empty/invalid. */
export function formatSessionTimestamp(value?: string | null): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

export function SessionTimeline({ steps, className }: SessionTimelineProps) {
  const visible = steps.filter((step) => Boolean(step.value));
  if (visible.length === 0) return null;

  return (
    <ol
      className={cn(
        "grid gap-2 rounded-lg border border-[var(--color-surface-light-container)] bg-muted/20 p-3 sm:grid-cols-2 lg:grid-cols-4 dark:border-[var(--color-surface-container-high)]",
        className,
      )}
    >
      {visible.map((step, index) => (
        <li key={step.key} className="min-w-0">
          <p className="text-body-sm text-muted-foreground">
            <span className="me-1 inline-flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
              {index + 1}
            </span>
            {step.label}
          </p>
          <p className="mt-1 truncate text-body-sm font-semibold text-foreground">
            {step.value}
          </p>
        </li>
      ))}
    </ol>
  );
}
