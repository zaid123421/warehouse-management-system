"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { VIZ_COLUMN_PANEL_CLASS } from "@/modules/warehouse-structure/lib/viz-layout";
import { vizTypography } from "@/modules/warehouse-structure/lib/viz-typography";
import { WarehouseVizRowRacksColumn } from "@/modules/warehouse-structure/components/warehouse-viz-row-racks-column";
import { WarehouseVizSlotPositionsColumn } from "@/modules/warehouse-structure/components/warehouse-viz-slot-positions-column";
import { WarehouseVizZonesColumn } from "@/modules/warehouse-structure/components/warehouse-viz-zones-column";
import type { MyWarehouse } from "@/modules/warehouse-structure/types/my-warehouse";
import type {
  WarehouseRack,
  WarehouseRow,
  WarehouseSlot,
  WarehouseZone,
} from "@/modules/warehouse-structure/types/warehouse-visualization";

export type WarehouseStructureBrowserProps = {
  warehouse: MyWarehouse;
};

type MobilePanel = "zones" | "racks" | "slots";

export function WarehouseStructureBrowser({ warehouse }: WarehouseStructureBrowserProps) {
  const t = useTranslations("warehouseStructure.viz");

  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<WarehouseRow | null>(null);
  const [selectedRack, setSelectedRack] = useState<WarehouseRack | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<WarehouseSlot | null>(null);

  const [zonesPage, setZonesPage] = useState(0);
  const [rowsPage, setRowsPage] = useState(0);
  const [racksPage, setRacksPage] = useState(0);
  const [slotsPage, setSlotsPage] = useState(0);
  const [positionsPage, setPositionsPage] = useState(0);

  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("zones");

  const handleSelectZone = useCallback((zone: WarehouseZone) => {
    setSelectedZoneId(zone.id);
    setSelectedRow(null);
    setSelectedRack(null);
    setSelectedSlot(null);
    setRowsPage(0);
    setRacksPage(0);
    setSlotsPage(0);
    setPositionsPage(0);
    setMobilePanel("zones");
  }, []);

  const handleSelectRow = useCallback((row: WarehouseRow) => {
    setSelectedRow(row);
    setSelectedRack(null);
    setSelectedSlot(null);
    setRacksPage(0);
    setSlotsPage(0);
    setPositionsPage(0);
    setMobilePanel("racks");
  }, []);

  const handleSelectRack = useCallback((rack: WarehouseRack) => {
    setSelectedRack(rack);
    setSelectedSlot(null);
    setSlotsPage(0);
    setPositionsPage(0);
    setMobilePanel("slots");
  }, []);

  const handleSelectSlot = useCallback((slot: WarehouseSlot) => {
    setSelectedSlot(slot);
    setPositionsPage(0);
  }, []);

  const handleZoneAutoSelect = useCallback((zoneId: number) => {
    setSelectedZoneId(zoneId);
  }, []);

  const breadcrumbItems: { label: string; active?: boolean }[] = [
    { label: warehouse.warehouseCode || warehouse.warehouseName },
    ...(selectedRow?.zoneName ? [{ label: selectedRow.zoneName }] : []),
    ...(selectedRow
      ? [{ label: t("rowLabel", { number: selectedRow.rowNumber }), active: !selectedRack }]
      : []),
    ...(selectedRack
      ? [{ label: t("rackLabel", { number: selectedRack.rackNumber }), active: !selectedSlot }]
      : []),
    ...(selectedSlot
      ? [{ label: t("slotLabel", { number: selectedSlot.slotNumber }), active: true }]
      : []),
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {breadcrumbItems.length > 0 ? (
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {breadcrumbItems.map((item, index) => (
            <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              {index > 0 ? (
                <span className="text-label-sm text-muted-foreground/50" aria-hidden>
                  ·
                </span>
              ) : null}
              <span
                className={cn(
                  item.active ? vizTypography.breadcrumbActive : vizTypography.breadcrumbMuted,
                )}
              >
                {item.label}
              </span>
            </span>
          ))}
        </p>
      ) : null}

      <div className="flex gap-2 lg:hidden">
        {(["zones", "racks", "slots"] as const).map((panel) => (
          <button
            key={panel}
            type="button"
            onClick={() => setMobilePanel(panel)}
            className={cn(
              "rounded-full px-3 py-1.5 text-label-md transition-colors",
              mobilePanel === panel
                ? "bg-primary-dark font-semibold text-white"
                : "bg-muted font-normal text-muted-foreground",
            )}
          >
            {t(`mobile.${panel}`)}
          </button>
        ))}
      </div>

      <Card className="min-h-[520px] flex-1 border border-border bg-card shadow-sm">
        <CardContent className="p-0">
          <div className="hidden min-h-[520px] xl:grid xl:grid-cols-[minmax(260px,1fr)_minmax(300px,1.1fr)_minmax(320px,1.2fr)]">
            <div
              className={cn(
                VIZ_COLUMN_PANEL_CLASS,
                "border-e border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]",
              )}
            >
              <WarehouseVizZonesColumn
                selectedZoneId={selectedZoneId}
                selectedRowId={selectedRow?.id ?? null}
                zonesPage={zonesPage}
                rowsPage={rowsPage}
                onZonesPageChange={setZonesPage}
                onRowsPageChange={setRowsPage}
                onSelectZone={handleSelectZone}
                onSelectRow={handleSelectRow}
                onZoneAutoSelect={handleZoneAutoSelect}
              />
            </div>
            <div
              className={cn(
                VIZ_COLUMN_PANEL_CLASS,
                "border-e border-[var(--color-surface-light-container)] dark:border-[var(--color-surface-container-high)]",
              )}
            >
              <WarehouseVizRowRacksColumn
                selectedRow={selectedRow}
                selectedRackId={selectedRack?.id ?? null}
                racksPage={racksPage}
                onRacksPageChange={setRacksPage}
                onSelectRack={handleSelectRack}
              />
            </div>
            <div className={VIZ_COLUMN_PANEL_CLASS}>
              <WarehouseVizSlotPositionsColumn
                selectedRack={selectedRack}
                selectedSlotId={selectedSlot?.id ?? null}
                selectedSlot={selectedSlot}
                slotsPage={slotsPage}
                positionsPage={positionsPage}
                onSlotsPageChange={setSlotsPage}
                onPositionsPageChange={setPositionsPage}
                onSelectSlot={handleSelectSlot}
              />
            </div>
          </div>

          <div className="hidden min-h-[520px] p-4 lg:block xl:hidden">
            <div className="grid min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-2">
              <WarehouseVizZonesColumn
                selectedZoneId={selectedZoneId}
                selectedRowId={selectedRow?.id ?? null}
                zonesPage={zonesPage}
                rowsPage={rowsPage}
                onZonesPageChange={setZonesPage}
                onRowsPageChange={setRowsPage}
                onSelectZone={handleSelectZone}
                onSelectRow={handleSelectRow}
                onZoneAutoSelect={handleZoneAutoSelect}
              />
              <div className="space-y-4">
                <WarehouseVizRowRacksColumn
                  selectedRow={selectedRow}
                  selectedRackId={selectedRack?.id ?? null}
                  racksPage={racksPage}
                  onRacksPageChange={setRacksPage}
                  onSelectRack={handleSelectRack}
                />
                <WarehouseVizSlotPositionsColumn
                  selectedRack={selectedRack}
                  selectedSlotId={selectedSlot?.id ?? null}
                  selectedSlot={selectedSlot}
                  slotsPage={slotsPage}
                  positionsPage={positionsPage}
                  onSlotsPageChange={setSlotsPage}
                  onPositionsPageChange={setPositionsPage}
                  onSelectSlot={handleSelectSlot}
                />
              </div>
            </div>
          </div>

          <div className="p-4 lg:hidden">
            {mobilePanel === "zones" ? (
              <WarehouseVizZonesColumn
                selectedZoneId={selectedZoneId}
                selectedRowId={selectedRow?.id ?? null}
                zonesPage={zonesPage}
                rowsPage={rowsPage}
                onZonesPageChange={setZonesPage}
                onRowsPageChange={setRowsPage}
                onSelectZone={handleSelectZone}
                onSelectRow={handleSelectRow}
                onZoneAutoSelect={handleZoneAutoSelect}
              />
            ) : null}
            {mobilePanel === "racks" ? (
              <WarehouseVizRowRacksColumn
                selectedRow={selectedRow}
                selectedRackId={selectedRack?.id ?? null}
                racksPage={racksPage}
                onRacksPageChange={setRacksPage}
                onSelectRack={handleSelectRack}
              />
            ) : null}
            {mobilePanel === "slots" ? (
              <WarehouseVizSlotPositionsColumn
                selectedRack={selectedRack}
                selectedSlotId={selectedSlot?.id ?? null}
                selectedSlot={selectedSlot}
                slotsPage={slotsPage}
                positionsPage={positionsPage}
                onSlotsPageChange={setSlotsPage}
                onPositionsPageChange={setPositionsPage}
                onSelectSlot={handleSelectSlot}
              />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
