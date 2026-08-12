"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { OccupancyProgressBar } from "@/modules/warehouse-structure/components/occupancy-progress-bar";
import { VisualizationListItem } from "@/modules/warehouse-structure/components/visualization-list-item";
import { VisualizationPagination } from "@/modules/warehouse-structure/components/visualization-pagination";
import { useWarehouseZones } from "@/modules/warehouse-structure/hooks/use-warehouse-zones";
import { useZoneRows } from "@/modules/warehouse-structure/hooks/use-zone-rows";
import { formatOccupancyRatio } from "@/modules/warehouse-structure/lib/occupancy-utils";
import { vizTypography } from "@/modules/warehouse-structure/lib/viz-typography";
import type { WarehouseRow, WarehouseZone } from "@/modules/warehouse-structure/types/warehouse-visualization";

export type WarehouseVizZonesColumnProps = {
  selectedZoneId: number | null;
  selectedRowId: number | null;
  zonesPage: number;
  rowsPage: number;
  onZonesPageChange: (page: number) => void;
  onRowsPageChange: (page: number) => void;
  onSelectZone: (zone: WarehouseZone) => void;
  onSelectRow: (row: WarehouseRow) => void;
  onZoneAutoSelect?: (zoneId: number) => void;
};

export function WarehouseVizZonesColumn({
  selectedZoneId,
  selectedRowId,
  zonesPage,
  rowsPage,
  onZonesPageChange,
  onRowsPageChange,
  onSelectZone,
  onSelectRow,
  onZoneAutoSelect,
}: WarehouseVizZonesColumnProps) {
  const t = useTranslations("warehouseStructure.viz");
  const zonesQuery = useWarehouseZones(zonesPage);
  const rowsQuery = useZoneRows(selectedZoneId, rowsPage);

  const zones = useMemo(() => zonesQuery.data?.items ?? [], [zonesQuery.data?.items]);
  const rows = rowsQuery.data?.items ?? [];

  useEffect(() => {
    if (selectedZoneId != null || zones.length === 0) return;
    onZoneAutoSelect?.(zones[0].id);
  }, [selectedZoneId, zones, onZoneAutoSelect]);

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <section className="space-y-3">
        <h2 className={vizTypography.columnHeading}>{t("columns.zones")}</h2>

        {zonesQuery.isError ? (
          <ErrorAlert
            message={zonesQuery.error instanceof Error ? zonesQuery.error.message : t("errorZones")}
            onRetry={() => void zonesQuery.refetch()}
            retryLabel={t("retry")}
          />
        ) : zonesQuery.isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : zones.length === 0 ? (
          <p className={vizTypography.empty}>{t("emptyZones")}</p>
        ) : (
          <div className="space-y-2">
            {zones.map((zone) => (
              <VisualizationListItem
                key={zone.id}
                emphasis
                title={zone.zoneName || t("unnamedZone")}
                subtitle={zone.description || undefined}
                selected={selectedZoneId === zone.id}
                onClick={() => onSelectZone(zone)}
                meta={
                  <span className={vizTypography.metaBadge}>
                    {t("rowCount", { count: zone.rowCount })}
                  </span>
                }
                footer={
                  <OccupancyProgressBar
                    summary={zone.summary}
                    label={formatOccupancyRatio(zone.summary)}
                  />
                }
              />
            ))}
          </div>
        )}

        {zonesQuery.data?.pageable ? (
          <VisualizationPagination
            pageable={zonesQuery.data.pageable}
            onPageChange={onZonesPageChange}
          />
        ) : null}
      </section>

      {selectedZoneId != null ? (
        <section className="space-y-3 border-t border-[var(--color-surface-light-container)] pt-4 dark:border-[var(--color-surface-container-high)]">
          <h2 className={vizTypography.columnHeading}>{t("columns.rows")}</h2>

          {rowsQuery.isError ? (
            <ErrorAlert
              message={rowsQuery.error instanceof Error ? rowsQuery.error.message : t("errorRows")}
              onRetry={() => void rowsQuery.refetch()}
              retryLabel={t("retry")}
            />
          ) : rowsQuery.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <p className={vizTypography.empty}>{t("emptyRows")}</p>
          ) : (
            <div className="space-y-2">
              {rows.map((row) => (
                <VisualizationListItem
                  key={row.id}
                  title={t("rowLabel", { number: row.rowNumber })}
                  subtitle={row.zoneName || undefined}
                  selected={selectedRowId === row.id}
                  onClick={() => onSelectRow(row)}
                  meta={
                    <span className={vizTypography.metaBadge}>
                      {t("rackCount", { count: row.rackCount })}
                    </span>
                  }
                  footer={
                    <OccupancyProgressBar
                      summary={row.summary}
                      label={formatOccupancyRatio(row.summary)}
                    />
                  }
                />
              ))}
            </div>
          )}

          {rowsQuery.data?.pageable ? (
            <VisualizationPagination
              pageable={rowsQuery.data.pageable}
              onPageChange={onRowsPageChange}
            />
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
