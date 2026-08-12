"use client";

import { cn } from "@/lib/utils";

export function OverviewPanel({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[var(--color-surface-light-container)] bg-card p-5 dark:border-[var(--color-surface-container-high)]",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-label-lg font-semibold text-foreground">{title}</h2>
          {description ? (
            <p className="mt-1 text-body-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function OverviewKpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "primary"
      ? "border-primary-dark/25 bg-primary-dark/[0.06] dark:bg-primary-dark/10"
      : tone === "success"
        ? "border-[var(--color-success-main-light)]/30 bg-[var(--color-success-container)]/60 dark:bg-[var(--color-success-main-dark)]/10"
        : tone === "warning"
          ? "border-amber-500/30 bg-amber-500/10"
          : tone === "danger"
            ? "border-[var(--color-error-main)]/30 bg-[var(--color-error-container)]/70"
            : "border-[var(--color-surface-light-container)] bg-card dark:border-[var(--color-surface-container-high)]";

  return (
    <div className={cn("rounded-xl border px-4 py-3.5", toneClass)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-1 text-body-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function HorizontalBar({
  label,
  valueLabel,
  percent,
  colorClass = "bg-primary-dark",
}: {
  label: string;
  valueLabel: string;
  percent: number;
  colorClass?: string;
}) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-body-sm">
        <span className="truncate font-medium text-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">{valueLabel}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted/80">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function OccupancyDonut({
  percent,
  centerLabel,
  segments,
}: {
  percent: number;
  centerLabel: string;
  segments: { value: number; color: string; label: string }[];
}) {
  const size = 180;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0) || 1;
  const activeSegments = segments.filter((s) => s.value > 0);
  const arcs = activeSegments.map((segment, index) => {
    const length = (segment.value / total) * circumference;
    const previousOffset = activeSegments
      .slice(0, index)
      .reduce((sum, item) => sum + (item.value / total) * circumference, 0);
    return {
      ...segment,
      dasharray: `${length} ${circumference - length}`,
      dashoffset: -previousOffset,
    };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/60"
          />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={stroke}
              strokeDasharray={arc.dasharray}
              strokeDashoffset={arc.dashoffset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-3xl font-bold tabular-nums text-foreground">
            {percent.toFixed(percent % 1 === 0 ? 0 : 1)}%
          </p>
          <p className="mt-0.5 max-w-[6.5rem] text-xs text-muted-foreground">{centerLabel}</p>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-3 text-body-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="truncate text-muted-foreground">{segment.label}</span>
            </span>
            <span className="font-semibold tabular-nums text-foreground">
              {segment.value.toLocaleString("en-US")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SlaGauge({
  label,
  percent,
}: {
  label: string;
  percent: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const size = 112;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (clamped / 100) * circumference;
  const tone =
    clamped >= 90
      ? "var(--color-success-main-light)"
      : clamped >= 75
        ? "var(--color-primary-main-light)"
        : "var(--color-error-main)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/70"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference - filled}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold tabular-nums text-foreground">
            {clamped.toFixed(clamped % 1 === 0 ? 0 : 1)}%
          </span>
        </div>
      </div>
      <p className="text-center text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function TireFlowBars({
  expected,
  received,
  stored,
  labels,
}: {
  expected: number;
  received: number;
  stored: number;
  labels: { expected: string; received: string; stored: string };
}) {
  const max = Math.max(expected, received, stored, 1);
  const rows = [
    { key: "expected", label: labels.expected, value: expected, color: "bg-sky-500/80" },
    { key: "received", label: labels.received, value: received, color: "bg-primary-dark" },
    { key: "stored", label: labels.stored, value: stored, color: "bg-[var(--color-success-main-light)]" },
  ] as const;

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <HorizontalBar
          key={row.key}
          label={row.label}
          valueLabel={row.value.toLocaleString("en-US")}
          percent={(row.value / max) * 100}
          colorClass={row.color}
        />
      ))}
    </div>
  );
}
