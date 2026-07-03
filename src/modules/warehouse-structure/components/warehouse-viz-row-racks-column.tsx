"use client";

import { useTranslations } from "next-intl";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { OccupancyProgressBar } from "@/modules/warehouse-structure/components/occupancy-progress-bar";
import { OccupancyStatGrid } from "@/modules/warehouse-structure/components/occupancy-stat-grid";
import { VisualizationListItem } from "@/modules/warehouse-structure/components/visualization-list-item";
import { VisualizationPagination } from "@/modules/warehouse-structure/components/visualization-pagination";
import { useRowRacks } from "@/modules/warehouse-structure/hooks/use-row-racks";
import { formatOccupancyRatio } from "@/modules/warehouse-structure/lib/occupancy-utils";
import { vizTypography } from "@/modules/warehouse-structure/lib/viz-typography";
import type { WarehouseRack, WarehouseRow } from "@/modules/warehouse-structure/types/warehouse-visualization";

export type WarehouseVizRowRacksColumnProps = {
  selectedRow: WarehouseRow | null;
  selectedRackId: number | null;
  racksPage: number;
  onRacksPageChange: (page: number) => void;
  onSelectRack: (rack: WarehouseRack) => void;
};

export function WarehouseVizRowRacksColumn({
  selectedRow,
  selectedRackId,
  racksPage,
  onRacksPageChange,
  onSelectRack,
}: WarehouseVizRowRacksColumnProps) {
  const t = useTranslations("warehouseStructure.viz");
  const racksQuery = useRowRacks(selectedRow?.id ?? null, racksPage);
  const racks = racksQuery.data?.items ?? [];

  if (!selectedRow) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-[var(--color-surface-light-container)] bg-card/50 p-6 dark:border-[var(--color-surface-container-high)]">
        <p className={vizTypography.hint}>{t("selectRowHint")}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="space-y-1">
        <h2 className={vizTypography.panelTitle}>
          {t("rowLabel", { number: selectedRow.rowNumber })}
        </h2>
        {selectedRow.zoneName ? (
          <p className={vizTypography.panelSubtitle}>{selectedRow.zoneName}</p>
        ) : null}
      </div>

      <OccupancyStatGrid
        summary={selectedRow.summary}
        extraStats={[
          { label: t("rackCountLabel"), value: selectedRow.rackCount, emphasis: "default" },
        ]}
      />

      <section className="space-y-3">
        <h3 className={vizTypography.columnHeading}>{t("columns.racks")}</h3>

        {racksQuery.isError ? (
          <ErrorAlert
            message={racksQuery.error instanceof Error ? racksQuery.error.message : t("errorRacks")}
            onRetry={() => void racksQuery.refetch()}
            retryLabel={t("retry")}
          />
        ) : racksQuery.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : racks.length === 0 ? (
          <p className={vizTypography.empty}>{t("emptyRacks")}</p>
        ) : (
          <div className="space-y-2">
            {racks.map((rack) => (
              <VisualizationListItem
                key={rack.id}
                title={t("rackLabel", { number: rack.rackNumber })}
                subtitle={t("rowLabel", { number: rack.rowNumber })}
                selected={selectedRackId === rack.id}
                onClick={() => onSelectRack(rack)}
                meta={
                  <span className={vizTypography.metaBadge}>
                    {t("slotCount", { count: rack.slotCount })}
                  </span>
                }
                footer={
                  <OccupancyProgressBar
                    summary={rack.summary}
                    label={formatOccupancyRatio(rack.summary)}
                  />
                }
              />
            ))}
          </div>
        )}

        {racksQuery.data?.pageable ? (
          <VisualizationPagination
            pageable={racksQuery.data.pageable}
            onPageChange={onRacksPageChange}
          />
        ) : null}
      </section>
    </div>
  );
}
