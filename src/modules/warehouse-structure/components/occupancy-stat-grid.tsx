"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  vizStatValueClass,
  vizTypography,
  type VizStatEmphasis,
} from "@/modules/warehouse-structure/lib/viz-typography";
import type { OccupancySummary } from "@/modules/warehouse-structure/types/warehouse-visualization";

type StatKey = keyof OccupancySummary;

const STAT_KEYS: StatKey[] = [
  "total",
  "occupied",
  "empty",
  "reservedInbound",
  "reservedOutbound",
];

export type OccupancyStatGridProps = {
  summary: OccupancySummary;
  className?: string;
  extraStats?: { label: string; value: string | number; emphasis?: VizStatEmphasis }[];
};

export function OccupancyStatGrid({ summary, className, extraStats }: OccupancyStatGridProps) {
  const t = useTranslations("warehouseStructure.viz");

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {STAT_KEYS.map((key) => {
        const isHighlight = key === "total" || key === "occupied";
        return (
          <div
            key={key}
            className={cn(
              "rounded-lg border px-3 py-2.5",
              isHighlight
                ? "border-primary-dark/20 bg-primary-dark/[0.04] dark:bg-primary-dark/[0.08]"
                : "border-[var(--color-surface-light-container)] bg-card dark:border-[var(--color-surface-container-high)]",
            )}
          >
            <p className={vizTypography.statLabel}>{t(`summary.${key}`)}</p>
            <p className={vizStatValueClass(key)}>{summary[key].toLocaleString()}</p>
          </div>
        );
      })}
      {extraStats?.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-[var(--color-surface-light-container)] bg-card px-3 py-2.5 dark:border-[var(--color-surface-container-high)]"
        >
          <p className={vizTypography.statLabel}>{stat.label}</p>
          <p
            className={
              stat.emphasis === "highlight"
                ? vizTypography.statValueHighlight
                : stat.emphasis === "muted"
                  ? vizTypography.statValueMuted
                  : vizTypography.statValueDefault
            }
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
