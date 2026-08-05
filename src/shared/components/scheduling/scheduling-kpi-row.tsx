"use client";

import { useTranslations } from "next-intl";
import { formatCount } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import type { SchedulingBoardStats } from "@/shared/lib/scheduling-grid-utils";

type SchedulingKpiRowProps = {
  stats: SchedulingBoardStats;
  translationNamespace: string;
  className?: string;
};

export function SchedulingKpiRow({
  stats,
  translationNamespace,
  className,
}: SchedulingKpiRowProps) {
  const t = useTranslations(translationNamespace);

  const items = [
    { label: t("statTotalRequests"), value: stats.totalRequests, emphasis: "default" as const },
    { label: t("statTotalTires"), value: stats.totalTires, emphasis: "primary" as const },
    {
      label: t("statAwaitingApproval"),
      value: stats.awaitingApproval,
      emphasis: "warning" as const,
    },
    {
      label: t("statEstimatedTrucks"),
      value: stats.estimatedTrucks,
      emphasis: "muted" as const,
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-xl border px-3 py-3 shadow-sm",
            item.emphasis === "warning" && "border-amber-500/30 bg-amber-500/10",
            item.emphasis === "primary" && "border-primary/25 bg-primary/5",
            (item.emphasis === "default" || item.emphasis === "muted") &&
              "border-[var(--color-surface-light-container)] bg-card dark:border-[var(--color-surface-container-high)]",
          )}
        >
          <p className="text-body-sm text-muted-foreground">{item.label}</p>
          <p
            className={cn(
              "mt-1 text-headline-sm font-bold",
              item.emphasis === "warning" && "text-amber-700 dark:text-amber-400",
              item.emphasis === "primary" && "text-primary",
              (item.emphasis === "default" || item.emphasis === "muted") && "text-foreground",
            )}
          >
            {formatCount(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
