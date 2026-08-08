import { getSchedulingCellTone, type SchedulingCellTone } from "@/shared/lib/scheduling-cell-tone";
import { toIsoDate } from "@/shared/lib/scheduling-week";

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
  serviceDate?: string;
  tone: SchedulingCellTone;
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

/** Grid columns are calendar dates, so two same-weekday cells from different weeks never collide. */
export function cellMatrixKey(region: string, isoDate: string): string {
  return `${region}::${isoDate}`;
}

export function toSchedulingGridCells<
  T extends {
    cellId: number;
    totalVolume: number;
    estimatedTrucks: number;
    requestCount: number;
    status: string;
    regionProvinceName?: string;
    serviceDate?: string | null;
  },
>(cells: T[], getDay: (cell: T) => string): SchedulingGridCell[] {
  return cells.map((cell) => {
    const day = getDay(cell).toUpperCase();
    const serviceDate = cell.serviceDate?.trim() || undefined;
    return {
      cellId: cell.cellId,
      day,
      regionProvinceName: cell.regionProvinceName?.trim() || "—",
      totalVolume: cell.totalVolume,
      estimatedTrucks: cell.estimatedTrucks,
      requestCount: cell.requestCount,
      status: cell.status,
      serviceDate,
      tone: getSchedulingCellTone({
        status: cell.status,
        serviceDate,
        weekday: day,
      }),
    };
  });
}

export function computeSchedulingBoardStats(
  cells: SchedulingGridCell[],
): SchedulingBoardStats {
  return cells.reduce(
    (acc, cell) => ({
      totalRequests: acc.totalRequests + cell.requestCount,
      totalTires: acc.totalTires + cell.totalVolume,
      awaitingApproval:
        acc.awaitingApproval +
        (cell.status === "PLANNED" || cell.status === "PARTIAL_APPROVAL" ? 1 : 0),
      estimatedTrucks: acc.estimatedTrucks + cell.estimatedTrucks,
    }),
    { totalRequests: 0, totalTires: 0, awaitingApproval: 0, estimatedTrucks: 0 },
  );
}

/**
 * Column date for a cell: its own `serviceDate`, or the matching weekday of the displayed week
 * for legacy cells stored without one.
 */
function resolveCellColumnDate(
  cell: SchedulingGridCell,
  weekDates: Date[],
): string | null {
  if (cell.serviceDate) {
    return cell.serviceDate.slice(0, 10);
  }
  const weekdayIndex = SCHEDULING_DAYS_OF_WEEK.indexOf(cell.day as SchedulingDay);
  if (weekdayIndex < 0 || weekdayIndex >= weekDates.length) {
    return null;
  }
  return toIsoDate(weekDates[weekdayIndex]);
}

export function buildSchedulingMatrix(
  cells: SchedulingGridCell[],
  weekDates: Date[],
): {
  regions: string[];
  columns: { date: Date; isoDate: string }[];
  lookup: Map<string, SchedulingGridCell>;
} {
  const columns = weekDates.map((date) => ({ date, isoDate: toIsoDate(date) }));
  const visibleDates = new Set(columns.map((column) => column.isoDate));

  const lookup = new Map<string, SchedulingGridCell>();
  const regions = new Set<string>();
  for (const cell of cells) {
    const isoDate = resolveCellColumnDate(cell, weekDates);
    if (!isoDate || !visibleDates.has(isoDate)) {
      continue;
    }
    lookup.set(cellMatrixKey(cell.regionProvinceName, isoDate), cell);
    regions.add(cell.regionProvinceName);
  }

  return {
    regions: Array.from(regions).sort((a, b) => a.localeCompare(b)),
    columns,
    lookup,
  };
}
