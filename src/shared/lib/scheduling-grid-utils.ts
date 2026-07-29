export const SCHEDULING_DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type SchedulingDay = (typeof SCHEDULING_DAYS_OF_WEEK)[number];

export type SchedulingGridCell = {
  cellId: number;
  day: string;
  regionProvinceName: string;
  totalVolume: number;
  estimatedTrucks: number;
  requestCount: number;
  status: string;
};

export type SchedulingBoardStats = {
  totalRequests: number;
  totalTires: number;
  awaitingApproval: number;
  estimatedTrucks: number;
};

export function formatSchedulingDayLabel(day: string): string {
  if (!day) return "—";
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export function formatSchedulingDayShort(day: string): string {
  return day.slice(0, 3).toUpperCase();
}

export function cellMatrixKey(region: string, day: string): string {
  return `${region}::${day}`;
}

export function toSchedulingGridCells<T extends { cellId: number; totalVolume: number; estimatedTrucks: number; requestCount: number; status: string; regionProvinceName?: string }>(
  cells: T[],
  getDay: (cell: T) => string,
): SchedulingGridCell[] {
  return cells.map((cell) => ({
    cellId: cell.cellId,
    day: getDay(cell).toUpperCase(),
    regionProvinceName: cell.regionProvinceName?.trim() || "—",
    totalVolume: cell.totalVolume,
    estimatedTrucks: cell.estimatedTrucks,
    requestCount: cell.requestCount,
    status: cell.status,
  }));
}

export function computeSchedulingBoardStats(
  cells: SchedulingGridCell[],
): SchedulingBoardStats {
  return cells.reduce(
    (acc, cell) => ({
      totalRequests: acc.totalRequests + cell.requestCount,
      totalTires: acc.totalTires + cell.totalVolume,
      awaitingApproval: acc.awaitingApproval + (cell.status === "PLANNED" ? 1 : 0),
      estimatedTrucks: acc.estimatedTrucks + cell.estimatedTrucks,
    }),
    { totalRequests: 0, totalTires: 0, awaitingApproval: 0, estimatedTrucks: 0 },
  );
}

export function buildSchedulingMatrix(cells: SchedulingGridCell[]): {
  regions: string[];
  days: readonly string[];
  lookup: Map<string, SchedulingGridCell>;
} {
  const lookup = new Map<string, SchedulingGridCell>();
  for (const cell of cells) {
    lookup.set(cellMatrixKey(cell.regionProvinceName, cell.day), cell);
  }
  const regions = Array.from(
    new Set(cells.map((cell) => cell.regionProvinceName)),
  ).sort((a, b) => a.localeCompare(b));
  return {
    regions,
    days: SCHEDULING_DAYS_OF_WEEK,
    lookup,
  };
}
