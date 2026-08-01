"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PRIMARY_BUTTON_CLASS } from "@/lib/primary-button-styles";
import { cn } from "@/lib/utils";
import {
  buildSchedulingMatrix,
  cellMatrixKey,
  formatSchedulingDayLabel,
  formatSchedulingDayShort,
  type SchedulingGridCell,
} from "@/shared/lib/scheduling-grid-utils";

type SchedulingWeekGridProps = {
  cells: SchedulingGridCell[];
  selectedCellId: number | null;
  onSelectCell: (cellId: number) => void;
  onApproveCell: (cell: SchedulingGridCell) => void;
  canApprove: (cell: SchedulingGridCell) => boolean;
  isApprovePending?: boolean;
  renderStatusBadge: (status: string) => ReactNode;
  translationNamespace: string;
  isLoading?: boolean;
};

export function SchedulingWeekGrid({
  cells,
  selectedCellId,
  onSelectCell,
  onApproveCell,
  canApprove,
  isApprovePending = false,
  renderStatusBadge,
  translationNamespace,
  isLoading = false,
}: SchedulingWeekGridProps) {
  const t = useTranslations(translationNamespace);
  const { regions, days, lookup } = buildSchedulingMatrix(cells);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (regions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-surface-light-container)] bg-card px-4 py-12 text-center dark:border-[var(--color-surface-container-high)]">
        <p className="text-body-md text-muted-foreground">{t("noSchedulingCells")}</p>
      </div>
    );
  }

  const borderColor =
    "border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]";

  return (
    <div className={cn("overflow-x-auto rounded-xl border-2", borderColor, "bg-card")}>
      <table className="w-full min-w-[56rem] border-separate border-spacing-0">
        <thead>
          <tr>
            <th
              className={cn(
                "sticky start-0 z-10 bg-[var(--color-surface-light-container)] px-3 py-3 text-start text-body-sm font-semibold text-foreground dark:bg-[var(--color-surface-container-high)]",
                "border-b-2",
                borderColor,
              )}
            >
              {t("gridRowRegion")}
            </th>
            {days.map((day) => (
              <th
                key={day}
                className={cn(
                  "min-w-[9rem] border-b-2 px-2 py-3 text-center text-body-sm font-semibold text-foreground",
                  borderColor,
                )}
              >
                <span className="block text-label-lg">{formatSchedulingDayShort(day)}</span>
                <span className="block text-body-sm font-normal text-muted-foreground">
                  {formatSchedulingDayLabel(day)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {regions.map((region) => (
            <tr key={region}>
              <td
                className={cn(
                  "sticky start-0 z-10 bg-card px-3 py-3 align-top text-body-md font-semibold text-foreground",
                  "border-b",
                  borderColor,
                )}
              >
                {region}
              </td>
              {days.map((day) => {
                const cell = lookup.get(cellMatrixKey(region, day));
                if (!cell) {
                  return (
                    <td
                      key={day}
                      className={cn("border-b px-2 py-2 align-top", borderColor)}
                    >
                      <div className="flex min-h-[7.5rem] items-center justify-center rounded-lg border border-dashed border-muted-foreground/20 bg-muted/20">
                        <span className="text-body-md text-muted-foreground">—</span>
                      </div>
                    </td>
                  );
                }

                const isSelected = selectedCellId === cell.cellId;
                const showApprove = canApprove(cell);

                return (
                  <td
                    key={day}
                    className={cn("border-b px-2 py-2 align-top", borderColor)}
                  >
                <div
  role="button"
  tabIndex={0}
  onClick={() => onSelectCell(cell.cellId)}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectCell(cell.cellId);
    }
  }}
  className={cn(
    "flex min-h-[7.5rem] w-full cursor-pointer flex-col gap-2 rounded-lg border p-3 text-start transition-colors",
    isSelected
      ? "border-primary bg-primary/5 ring-2 ring-primary/30"
      : "border-[var(--color-surface-light-container)] bg-card hover:bg-muted/40 dark:border-[var(--color-surface-container-high)]",
  )}
>
                      <div className="space-y-0.5">
                        <p className="text-body-md font-semibold text-foreground">
                          {t("gridCellTires", { count: cell.totalVolume })}
                        </p>
                        <p className="text-body-sm text-muted-foreground">
                          {t("gridCellRequests", { count: cell.requestCount })}
                        </p>
                        <p className="text-body-sm text-muted-foreground">
                          {t("gridCellTrucks", { count: cell.estimatedTrucks })}
                        </p>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-2">
                        {renderStatusBadge(cell.status)}
                        {showApprove ? (
                          <Button
                            type="button"
                            size="xs"
                            className={cn("h-7 px-2", PRIMARY_BUTTON_CLASS)}
                            disabled={isApprovePending}
                            onClick={(event) => {
                              event.stopPropagation();
                              onApproveCell(cell);
                            }}
                          >
                            <Check className="size-3" />
                            {t("approveCellShort")}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
