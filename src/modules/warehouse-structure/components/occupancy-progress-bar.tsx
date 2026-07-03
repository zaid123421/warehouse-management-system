"use client";

import { cn } from "@/lib/utils";
import { occupancyPercent } from "@/modules/warehouse-structure/lib/occupancy-utils";
import { vizTypography } from "@/modules/warehouse-structure/lib/viz-typography";
import type { OccupancySummary } from "@/modules/warehouse-structure/types/warehouse-visualization";

export type OccupancyProgressBarProps = {
  summary: OccupancySummary;
  className?: string;
  showLabel?: boolean;
  label?: string;
};

export function OccupancyProgressBar({
  summary,
  className,
  showLabel = true,
  label,
}: OccupancyProgressBarProps) {
  const percent = occupancyPercent(summary);

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && label ? (
        <div className="flex items-center justify-between gap-2">
          <span className={vizTypography.progressLabel}>{label}</span>
          <span className={vizTypography.progressValue}>{percent}%</span>
        </div>
      ) : null}
      <div className="h-1.5 overflow-hidden rounded-full bg-muted/80">
        <div
          className="h-full rounded-full bg-primary-dark transition-all duration-300"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
