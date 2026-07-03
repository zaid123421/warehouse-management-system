import type { OccupancySummary } from "@/modules/warehouse-structure/types/warehouse-visualization";

export function occupancyPercent(summary: OccupancySummary): number {
  if (summary.total <= 0) return 0;
  return Math.round((summary.occupied / summary.total) * 100);
}

export function formatOccupancyRatio(summary: OccupancySummary): string {
  return `${summary.occupied}/${summary.total}`;
}
