import { asRecord, num, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type { StoragePositionHistoryEntry } from "@/modules/warehouse-structure/types/storage-position-history";
import type {
  TireLocationHistoryEntry,
  TireLookupLocation,
  TireLookupResult,
  TireStatusHistoryEntry,
} from "@/modules/warehouse-structure/types/tire-lookup";

function optionalId(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = num(value);
  return n > 0 ? n : null;
}

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function pickTimestamp(rec: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = rec[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const rec = asRecord(value);
  if (!rec) return [];
  if (Array.isArray(rec.content)) return rec.content;
  if (Array.isArray(rec.items)) return rec.items;
  if (Array.isArray(rec.body)) return rec.body;
  return [];
}

function normalizeLocation(raw: unknown): TireLookupLocation | null {
  const rec = asRecord(raw);
  if (!rec) return null;

  return {
    storagePositionId: optionalId(rec.storagePositionId),
    locationBarcode: optionalString(rec.locationBarcode),
    occupancy: str(rec.occupancy),
    positionStatus: str(rec.positionStatus),
    zoneId: optionalId(rec.zoneId),
    zoneName: str(rec.zoneName),
    rowId: optionalId(rec.rowId),
    rowNumber: optionalId(rec.rowNumber),
    rackId: optionalId(rec.rackId),
    rackNumber: optionalId(rec.rackNumber),
    slotId: optionalId(rec.slotId),
    slotNumber: optionalId(rec.slotNumber),
    positionNumber: optionalId(rec.positionNumber),
  };
}

function normalizeStatusHistoryEntry(raw: unknown): TireStatusHistoryEntry | null {
  const rec = asRecord(raw);
  if (!rec) return null;

  return {
    id: optionalId(rec.id),
    tireId: optionalId(rec.tireId),
    historyType: str(rec.historyType),
    status: str(rec.status) || "—",
    notes: str(rec.notes) || str(rec.note),
    historyDate: pickTimestamp(rec, "historyDate", "createdAt"),
    createdAt: pickTimestamp(rec, "createdAt", "historyDate"),
  };
}

function normalizeLocationHistoryEntry(raw: unknown): TireLocationHistoryEntry | null {
  const rec = asRecord(raw);
  if (!rec) return null;

  return {
    id: optionalId(rec.id),
    storagePositionId: optionalId(rec.storagePositionId),
    tireId: optionalId(rec.tireId),
    action: str(rec.action) || "—",
    previousLocation: optionalString(rec.previousLocation),
    newLocation: optionalString(rec.newLocation),
    actionDate: pickTimestamp(rec, "actionDate", "createdAt"),
    notes: str(rec.notes) || str(rec.note),
  };
}

export function normalizeTireLookupResult(data: unknown): TireLookupResult | null {
  const payload = unwrapPayload(data);
  const rec = Object.keys(payload).length > 0 ? payload : asRecord(data);
  if (!rec) return null;

  const tireUniqueId =
    str(rec.tireUniqueId) || str(rec.uniqueId) || str(rec.tire_unique_id);
  if (!tireUniqueId) return null;

  return {
    tireId: optionalId(rec.tireId),
    tireUniqueId,
    status: str(rec.status),
    dealerId: optionalId(rec.dealerId),
    dealerName: str(rec.dealerName),
    location: normalizeLocation(rec.location),
    statusHistory: asArray(rec.statusHistory)
      .map(normalizeStatusHistoryEntry)
      .filter((item): item is TireStatusHistoryEntry => item != null),
    locationHistory: asArray(rec.locationHistory)
      .map(normalizeLocationHistoryEntry)
      .filter((item): item is TireLocationHistoryEntry => item != null),
  };
}

export function normalizeStoragePositionHistory(
  data: unknown,
): StoragePositionHistoryEntry[] {
  const root = asRecord(data);
  const list = Array.isArray(data)
    ? data
    : asArray(root?.data ?? root?.body ?? root?.content ?? root?.items ?? root?.history);

  return list
    .map((item): StoragePositionHistoryEntry | null => {
      const rec = asRecord(item);
      if (!rec) return null;
      const action =
        str(rec.action) || str(rec.eventType) || str(rec.type) || str(rec.event);
      return {
        id: optionalId(rec.id),
        action: action || "—",
        occurredAt: pickTimestamp(rec, "occurredAt", "actionDate", "createdAt", "timestamp"),
        actor:
          str(rec.actor) ||
          str(rec.actorName) ||
          str(rec.performedBy) ||
          str(rec.userName) ||
          str(rec.createdBy),
        tireUniqueId:
          str(rec.tireUniqueId) || str(rec.uniqueId) || str(rec.tire_unique_id),
        tireId: optionalId(rec.tireId),
        note: str(rec.notes) || str(rec.note) || str(rec.reason) || str(rec.message),
        raw: rec,
      };
    })
    .filter((item): item is StoragePositionHistoryEntry => item != null);
}
