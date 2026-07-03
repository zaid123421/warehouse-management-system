"use client";

import { useTranslations } from "next-intl";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StyledTable } from "@/components/ui/styled-table";
import { cn } from "@/lib/utils";
import { OccupancyProgressBar } from "@/modules/warehouse-structure/components/occupancy-progress-bar";
import { OccupancyStatGrid } from "@/modules/warehouse-structure/components/occupancy-stat-grid";
import { PositionStatusBadge } from "@/modules/warehouse-structure/components/position-status-badge";
import { VisualizationPagination } from "@/modules/warehouse-structure/components/visualization-pagination";
import { useRackSlots } from "@/modules/warehouse-structure/hooks/use-rack-slots";
import { useSlotPositions } from "@/modules/warehouse-structure/hooks/use-slot-positions";
import { formatOccupancyRatio } from "@/modules/warehouse-structure/lib/occupancy-utils";
import { vizTypography } from "@/modules/warehouse-structure/lib/viz-typography";
import type {
  WarehouseRack,
  WarehouseSlot,
} from "@/modules/warehouse-structure/types/warehouse-visualization";

export type WarehouseVizSlotPositionsColumnProps = {
  selectedRack: WarehouseRack | null;
  selectedSlotId: number | null;
  selectedSlot: WarehouseSlot | null;
  slotsPage: number;
  positionsPage: number;
  onSlotsPageChange: (page: number) => void;
  onPositionsPageChange: (page: number) => void;
  onSelectSlot: (slot: WarehouseSlot) => void;
};

export function WarehouseVizSlotPositionsColumn({
  selectedRack,
  selectedSlotId,
  selectedSlot,
  slotsPage,
  positionsPage,
  onSlotsPageChange,
  onPositionsPageChange,
  onSelectSlot,
}: WarehouseVizSlotPositionsColumnProps) {
  const t = useTranslations("warehouseStructure.viz");
  const slotsQuery = useRackSlots(selectedRack?.id ?? null, slotsPage);
  const positionsQuery = useSlotPositions(selectedSlotId, positionsPage);

  const slots = slotsQuery.data?.items ?? [];
  const positions = positionsQuery.data?.items ?? [];

  if (!selectedRack) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-[var(--color-surface-light-container)] bg-card/50 p-6 dark:border-[var(--color-surface-container-high)]">
        <p className={vizTypography.hint}>{t("selectRackHint")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="space-y-1">
        <h2 className={vizTypography.panelTitle}>
          {t("rackLabel", { number: selectedRack.rackNumber })}
        </h2>
        <p className={vizTypography.panelSubtitle}>
          {t("rowLabel", { number: selectedRack.rowNumber })}
        </p>
      </div>

      <OccupancyStatGrid
        summary={selectedRack.summary}
        extraStats={[
          { label: t("slotCountLabel"), value: selectedRack.slotCount, emphasis: "default" },
        ]}
      />

      <section className="space-y-3">
        <h3 className={vizTypography.columnHeading}>{t("columns.slots")}</h3>

        {slotsQuery.isError ? (
          <ErrorAlert
            message={slotsQuery.error instanceof Error ? slotsQuery.error.message : t("errorSlots")}
            onRetry={() => void slotsQuery.refetch()}
            retryLabel={t("retry")}
          />
        ) : slotsQuery.isPending ? (
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : slots.length === 0 ? (
          <p className={vizTypography.empty}>{t("emptySlots")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelectSlot(slot)}
                className={cn(
                  "rounded-xl border-2 p-3 text-start transition-colors",
                  selectedSlotId === slot.id
                    ? "border-primary-dark bg-primary-dark/5"
                    : "border-[var(--color-surface-light-container)] bg-card hover:border-primary-dark/40 dark:border-[var(--color-surface-container-high)]",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={cn(
                      vizTypography.listTitleDefault,
                      selectedSlotId === slot.id && "text-primary-dark",
                    )}
                  >
                    {t("slotLabel", { number: slot.slotNumber })}
                  </p>
                  <span className={vizTypography.progressValue}>
                    {formatOccupancyRatio(slot.summary)}
                  </span>
                </div>
                <OccupancyProgressBar
                  className="mt-3"
                  summary={slot.summary}
                  showLabel={false}
                />
              </button>
            ))}
          </div>
        )}

        {slotsQuery.data?.pageable ? (
          <VisualizationPagination
            pageable={slotsQuery.data.pageable}
            onPageChange={onSlotsPageChange}
          />
        ) : null}
      </section>

      {selectedSlot ? (
        <section className="space-y-3 border-t border-[var(--color-surface-light-container)] pt-4 dark:border-[var(--color-surface-container-high)]">
          <div>
            <h3 className={vizTypography.sectionTitle}>
              {t("positionsTitle", { number: selectedSlot.slotNumber })}
            </h3>
            <p className={vizTypography.panelSubtitle}>
              {t("rackLabel", { number: selectedSlot.rackNumber })}
            </p>
          </div>

          {positionsQuery.isError ? (
            <ErrorAlert
              message={
                positionsQuery.error instanceof Error
                  ? positionsQuery.error.message
                  : t("errorPositions")
              }
              onRetry={() => void positionsQuery.refetch()}
              retryLabel={t("retry")}
            />
          ) : (
            <StyledTable
              horizontalScroll
              isLoading={positionsQuery.isPending}
              emptyText={t("emptyPositions")}
              keyProp={(row) => row.id}
              rows={positions}
              columns={[
                {
                  header: t("positionsTable.position"),
                  render: (row) => (
                    <span className={vizTypography.tablePrimary}>#{row.positionNumber}</span>
                  ),
                },
                {
                  header: t("positionsTable.barcode"),
                  render: (row) => (
                    <span className={vizTypography.tableMono}>
                      {row.locationBarcode ?? "—"}
                    </span>
                  ),
                },
                {
                  header: t("positionsTable.status"),
                  render: (row) => <PositionStatusBadge status={row.status} />,
                },
                {
                  header: t("positionsTable.tireLabel"),
                  className: "!whitespace-normal max-w-[12rem]",
                  render: (row) => (
                    <span
                      className={cn(
                        "block break-words",
                        row.tireLabel ? vizTypography.tablePrimary : vizTypography.tableMuted,
                      )}
                    >
                      {row.tireLabel || "—"}
                    </span>
                  ),
                },
                {
                  header: t("positionsTable.tireId"),
                  render: (row) => (
                    <span className={vizTypography.tableMono}>
                      {row.tireId != null ? row.tireId : "—"}
                    </span>
                  ),
                },
                {
                  header: t("positionsTable.reservedFor"),
                  render: (row) => (
                    <span className={vizTypography.tableMono}>
                      {row.reservedForTireId != null ? row.reservedForTireId : "—"}
                    </span>
                  ),
                },
              ]}
            />
          )}

          {positionsQuery.data?.pageable ? (
            <VisualizationPagination
              pageable={positionsQuery.data.pageable}
              onPageChange={onPositionsPageChange}
            />
          ) : null}
        </section>
      ) : (
        <p className={vizTypography.hint}>{t("selectSlotHint")}</p>
      )}
    </div>
  );
}
