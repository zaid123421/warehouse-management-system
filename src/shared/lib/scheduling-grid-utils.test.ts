import { describe, expect, it } from "vitest";
import {
  buildSchedulingMatrix,
  cellMatrixKey,
  computeSchedulingBoardStats,
  toSchedulingGridCells,
  type SchedulingGridCell,
} from "@/shared/lib/scheduling-grid-utils";
import { buildWeekDates, startOfWeek } from "@/shared/lib/scheduling-week";

/** 2026-08-03 is a Monday; 2026-08-04 the Tuesday of that week. */
const WEEK_DATES = buildWeekDates(new Date(2026, 7, 3));
const NEXT_WEEK_DATES = buildWeekDates(new Date(2026, 7, 10));

function gridCell(overrides: Partial<SchedulingGridCell> = {}): SchedulingGridCell {
  return {
    cellId: 1,
    day: "TUESDAY",
    regionProvinceName: "Aleppo",
    totalVolume: 10,
    estimatedTrucks: 1,
    requestCount: 2,
    status: "PLANNED",
    serviceDate: "2026-08-04",
    tone: "upcoming",
    ...overrides,
  };
}

describe("buildSchedulingMatrix", () => {
  it("keys cells by region and service date", () => {
    const cell = gridCell();

    const { regions, columns, lookup } = buildSchedulingMatrix([cell], WEEK_DATES);

    expect(regions).toEqual(["Aleppo"]);
    expect(columns).toHaveLength(7);
    expect(columns[0].isoDate).toBe("2026-08-03");
    expect(lookup.get(cellMatrixKey("Aleppo", "2026-08-04"))).toBe(cell);
  });

  it("keeps two same-weekday cells from different weeks apart", () => {
    const thisWeek = gridCell({ cellId: 1, serviceDate: "2026-08-04" });
    const nextWeek = gridCell({ cellId: 2, serviceDate: "2026-08-11" });

    const current = buildSchedulingMatrix([thisWeek, nextWeek], WEEK_DATES);
    const upcoming = buildSchedulingMatrix([thisWeek, nextWeek], NEXT_WEEK_DATES);

    expect(current.lookup.get(cellMatrixKey("Aleppo", "2026-08-04"))?.cellId).toBe(1);
    expect(current.lookup.size).toBe(1);
    expect(upcoming.lookup.get(cellMatrixKey("Aleppo", "2026-08-11"))?.cellId).toBe(2);
    expect(upcoming.lookup.size).toBe(1);
  });

  it("drops cells outside the displayed week", () => {
    const { regions, lookup } = buildSchedulingMatrix(
      [gridCell({ serviceDate: "2026-09-01" })],
      WEEK_DATES,
    );

    expect(regions).toEqual([]);
    expect(lookup.size).toBe(0);
  });

  it("places a cell without a service date on its weekday column of the shown week", () => {
    const legacy = gridCell({ serviceDate: undefined, day: "THURSDAY" });

    const { lookup } = buildSchedulingMatrix([legacy], WEEK_DATES);

    expect(lookup.get(cellMatrixKey("Aleppo", "2026-08-06"))).toBe(legacy);
  });

  it("tolerates an ISO datetime service date", () => {
    const cell = gridCell({ serviceDate: "2026-08-04T00:00:00" });

    const { lookup } = buildSchedulingMatrix([cell], WEEK_DATES);

    expect(lookup.get(cellMatrixKey("Aleppo", "2026-08-04"))).toBe(cell);
  });
});

describe("toSchedulingGridCells", () => {
  it("normalizes region name and uppercases the weekday", () => {
    const [cell] = toSchedulingGridCells(
      [
        {
          cellId: 3,
          totalVolume: 8,
          estimatedTrucks: 1,
          requestCount: 2,
          status: "APPROVED",
          regionProvinceName: "  Homs  ",
          serviceDate: "2026-08-04",
        },
      ],
      () => "tuesday",
    );

    expect(cell.regionProvinceName).toBe("Homs");
    expect(cell.day).toBe("TUESDAY");
    expect(cell.tone).toBe("scheduled");
  });
});

describe("computeSchedulingBoardStats", () => {
  it("counts only unapproved cells as awaiting approval", () => {
    const stats = computeSchedulingBoardStats([
      gridCell({ cellId: 1, status: "PLANNED" }),
      gridCell({ cellId: 2, status: "PARTIAL_APPROVAL" }),
      gridCell({ cellId: 3, status: "APPROVED" }),
    ]);

    expect(stats.awaitingApproval).toBe(2);
    expect(stats.totalRequests).toBe(6);
    expect(stats.totalTires).toBe(30);
    expect(stats.estimatedTrucks).toBe(3);
  });
});

describe("startOfWeek", () => {
  it("anchors on Monday regardless of the day passed in", () => {
    expect(startOfWeek(new Date(2026, 7, 9))).toEqual(new Date(2026, 7, 3));
    expect(startOfWeek(new Date(2026, 7, 3))).toEqual(new Date(2026, 7, 3));
  });
});
