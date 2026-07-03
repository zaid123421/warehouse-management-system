import { asRecord, pickNumber, str } from "@/shared/lib/dto-utils";
import type {
  OccupancySummary,
  PaginatedResult,
  PageableMeta,
  WarehousePosition,
  WarehouseRack,
  WarehouseRow,
  WarehouseSlot,
  WarehouseZone,
} from "@/modules/warehouse-structure/types/warehouse-visualization";

function normalizeSummary(raw: unknown): OccupancySummary {
  const rec = asRecord(raw) ?? {};
  return {
    empty: pickNumber(rec, "empty"),
    occupied: pickNumber(rec, "occupied"),
    reservedInbound: pickNumber(rec, "reservedInbound"),
    reservedOutbound: pickNumber(rec, "reservedOutbound"),
    total: pickNumber(rec, "total"),
  };
}

function normalizePageable(raw: unknown): PageableMeta {
  const rec = asRecord(raw) ?? {};
  return {
    page: pickNumber(rec, "page"),
    perPage: pickNumber(rec, "perPage"),
    total: pickNumber(rec, "total"),
  };
}

export function normalizePaginatedResponse<T>(
  data: unknown,
  normalizeItem: (raw: unknown) => T | null,
): PaginatedResult<T> {
  const root = asRecord(data) ?? {};
  const body = root.body;
  const items = Array.isArray(body)
    ? body.map(normalizeItem).filter((item): item is T => item != null)
    : [];
  return {
    items,
    pageable: normalizePageable(root.pageable),
  };
}

export function normalizeWarehouseZone(raw: unknown): WarehouseZone | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id");
  if (!id) return null;
  return {
    id,
    warehouseId: pickNumber(rec, "warehouseId"),
    zoneName: str(rec.zoneName),
    description: str(rec.description),
    rowCount: pickNumber(rec, "rowCount"),
    summary: normalizeSummary(rec.summary),
  };
}

export function normalizeWarehouseRow(raw: unknown): WarehouseRow | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id");
  if (!id) return null;
  return {
    id,
    zoneId: pickNumber(rec, "zoneId"),
    zoneName: str(rec.zoneName),
    rowNumber: pickNumber(rec, "rowNumber"),
    rackCount: pickNumber(rec, "rackCount"),
    summary: normalizeSummary(rec.summary),
  };
}

export function normalizeWarehouseRack(raw: unknown): WarehouseRack | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id");
  if (!id) return null;
  return {
    id,
    rowId: pickNumber(rec, "rowId"),
    rowNumber: pickNumber(rec, "rowNumber"),
    rackNumber: pickNumber(rec, "rackNumber"),
    slotCount: pickNumber(rec, "slotCount"),
    summary: normalizeSummary(rec.summary),
  };
}

export function normalizeWarehouseSlot(raw: unknown): WarehouseSlot | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id");
  if (!id) return null;
  return {
    id,
    rackId: pickNumber(rec, "rackId"),
    rackNumber: pickNumber(rec, "rackNumber"),
    slotNumber: pickNumber(rec, "slotNumber"),
    summary: normalizeSummary(rec.summary),
  };
}

function optionalId(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

export function normalizeWarehousePosition(raw: unknown): WarehousePosition | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id");
  if (!id) return null;
  return {
    id,
    positionNumber: pickNumber(rec, "positionNumber"),
    locationBarcode:
      typeof rec.locationBarcode === "string" && rec.locationBarcode.trim()
        ? rec.locationBarcode.trim()
        : null,
    status: str(rec.status),
    tireLabel: str(rec.tireLabel),
    tireId: optionalId(rec.tireId),
    reservedForTireId: optionalId(rec.reservedForTireId),
  };
}
