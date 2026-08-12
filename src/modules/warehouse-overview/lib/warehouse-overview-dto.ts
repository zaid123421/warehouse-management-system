import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type {
  OccupancyUsage,
  OverviewActivity,
  OverviewAttentionItem,
  OverviewCapacity,
  OverviewLive,
  OverviewSessionProgress,
  OverviewStaff,
  OverviewTopPerformer,
  OverviewZone,
  WarehouseOverview,
} from "@/modules/warehouse-overview/types/warehouse-overview";

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.trim());
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function normalizeUsage(raw: unknown): OccupancyUsage {
  const rec = asRecord(raw) ?? {};
  return {
    empty: pickNumber(rec, "empty"),
    occupied: pickNumber(rec, "occupied"),
    reservedInbound: pickNumber(rec, "reservedInbound"),
    reservedOutbound: pickNumber(rec, "reservedOutbound"),
    total: pickNumber(rec, "total"),
  };
}

function normalizeZone(raw: unknown): OverviewZone | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const zoneId = pickNumber(rec, "zoneId") || pickNumber(rec, "id");
  if (!zoneId) return null;
  return {
    zoneId,
    zoneName: pickString(rec, "zoneName") || `Zone ${zoneId}`,
    occupancyPercent: pickNumber(rec, "occupancyPercent"),
    usage: normalizeUsage(rec.usage),
  };
}

function normalizeAttention(raw: unknown): OverviewAttentionItem | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const title = pickString(rec, "title") || str(rec.type);
  if (!title) return null;
  return {
    type: str(rec.type),
    entityId: optionalId(rec.entityId),
    title,
    subtitle: pickString(rec, "subtitle") ?? "",
    occurredAt: optionalString(rec.occurredAt),
  };
}

function normalizePerformer(raw: unknown): OverviewTopPerformer | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const userId = pickNumber(rec, "userId") || pickNumber(rec, "id");
  if (!userId) return null;
  return {
    userId,
    displayName: pickString(rec, "displayName") || `#${userId}`,
    matchScans: pickNumber(rec, "matchScans"),
  };
}

function normalizeLive(raw: unknown): OverviewLive {
  const rec = asRecord(raw) ?? {};
  return {
    activeInboundRequestCount: pickNumber(rec, "activeInboundRequestCount"),
    totalExpectedTires: pickNumber(rec, "totalExpectedTires"),
    totalReceivedTires: pickNumber(rec, "totalReceivedTires"),
    totalStoredTires: pickNumber(rec, "totalStoredTires"),
    reservedLineCount: pickNumber(rec, "reservedLineCount"),
    expiredReservationCount: pickNumber(rec, "expiredReservationCount"),
    receivingSessionsInProgress: pickNumber(rec, "receivingSessionsInProgress"),
    putawaySessionsInProgress: pickNumber(rec, "putawaySessionsInProgress"),
    pickingSessionsInProgress: pickNumber(rec, "pickingSessionsInProgress"),
    openShippingSessionCount: pickNumber(rec, "openShippingSessionCount"),
    receivingExceptionScanCount: pickNumber(rec, "receivingExceptionScanCount"),
    putawayExceptionScanCount: pickNumber(rec, "putawayExceptionScanCount"),
    pickingMissingLineCount: pickNumber(rec, "pickingMissingLineCount"),
    pickingExceptionScanCount: pickNumber(rec, "pickingExceptionScanCount"),
    shippingMissingLineCount: pickNumber(rec, "shippingMissingLineCount"),
    shippingExceptionScanCount: pickNumber(rec, "shippingExceptionScanCount"),
  };
}

function normalizeCapacity(raw: unknown): OverviewCapacity {
  const rec = asRecord(raw) ?? {};
  const zonesRaw = Array.isArray(rec.topZones) ? rec.topZones : [];
  return {
    designedCapacity: pickNumber(rec, "designedCapacity"),
    occupancyPercent: pickNumber(rec, "occupancyPercent"),
    warehouse: normalizeUsage(rec.warehouse),
    topZones: zonesRaw
      .map(normalizeZone)
      .filter((zone): zone is OverviewZone => zone != null),
  };
}

function normalizeStaff(raw: unknown): OverviewStaff {
  const rec = asRecord(raw) ?? {};
  return {
    staffTotal: pickNumber(rec, "staffTotal"),
    staffActive: pickNumber(rec, "staffActive"),
  };
}

function normalizeActivity(raw: unknown): OverviewActivity {
  const rec = asRecord(raw) ?? {};
  const performersRaw = Array.isArray(rec.topPerformers) ? rec.topPerformers : [];
  return {
    slaInboundOnTimePercent: pickNumber(rec, "slaInboundOnTimePercent"),
    slaOutboundOnTimePercent: pickNumber(rec, "slaOutboundOnTimePercent"),
    slaOpenOverdue: pickNumber(rec, "slaOpenOverdue"),
    pendingInbound: pickNumber(rec, "pendingInbound"),
    pendingOutbound: pickNumber(rec, "pendingOutbound"),
    topPerformers: performersRaw
      .map(normalizePerformer)
      .filter((item): item is OverviewTopPerformer => item != null),
  };
}

function normalizeReceivingSession(raw: unknown): OverviewSessionProgress | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const sessionId = pickNumber(rec, "sessionId") || pickNumber(rec, "id");
  if (!sessionId) return null;
  const truckLabel =
    pickString(rec, "inboundTruckLabel") ||
    (pickNumber(rec, "inboundTruckId")
      ? `Truck #${pickNumber(rec, "inboundTruckId")}`
      : `Session #${sessionId}`);
  return {
    sessionId,
    status: str(rec.status),
    progressPercent: pickNumber(rec, "progressPercent"),
    label: truckLabel,
    detail: `${pickNumber(rec, "receivedTires")}/${pickNumber(rec, "expectedTires")}`,
    exceptionScanCount: pickNumber(rec, "exceptionScanCount"),
  };
}

function normalizePutawaySession(raw: unknown): OverviewSessionProgress | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const sessionId = pickNumber(rec, "sessionId") || pickNumber(rec, "id");
  if (!sessionId) return null;
  const zoneName = pickString(rec, "zoneName") || `Session #${sessionId}`;
  return {
    sessionId,
    status: str(rec.status),
    progressPercent: pickNumber(rec, "progressPercent"),
    label: zoneName,
    detail: `${pickNumber(rec, "completedCount")}/${pickNumber(rec, "tireCount")}`,
    exceptionScanCount: pickNumber(rec, "exceptionScanCount"),
  };
}

function normalizeGenericSession(
  raw: unknown,
  detailKeys: [string, string],
): OverviewSessionProgress | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const sessionId = pickNumber(rec, "sessionId") || pickNumber(rec, "id");
  if (!sessionId) return null;
  return {
    sessionId,
    status: str(rec.status),
    progressPercent: pickNumber(rec, "progressPercent"),
    label: pickString(rec, "label") || `Session #${sessionId}`,
    detail: `${pickNumber(rec, detailKeys[0])}/${pickNumber(rec, detailKeys[1])}`,
    exceptionScanCount: pickNumber(rec, "exceptionScanCount"),
  };
}

export function normalizeWarehouseOverview(data: unknown): WarehouseOverview {
  const root = unwrapPayload(data);
  const activityWindow = asRecord(root.activityWindow) ?? {};
  const operations = asRecord(root.operations) ?? {};
  const alertsRaw = Array.isArray(operations.alerts) ? operations.alerts : [];
  const attentionRaw = Array.isArray(root.attention) ? root.attention : [];
  const receivingRaw = Array.isArray(operations.receivingSessions)
    ? operations.receivingSessions
    : [];
  const putawayRaw = Array.isArray(operations.putawaySessions)
    ? operations.putawaySessions
    : [];
  const pickingRaw = Array.isArray(operations.pickingSessions)
    ? operations.pickingSessions
    : [];
  const shippingRaw = Array.isArray(operations.shippingSessions)
    ? operations.shippingSessions
    : [];

  return {
    warehouseId: pickNumber(root, "warehouseId"),
    warehouseName: pickString(root, "warehouseName") || "Warehouse",
    generatedAt: optionalString(root.generatedAt),
    activityWindow: {
      from: optionalString(activityWindow.from),
      to: optionalString(activityWindow.to),
      days: pickNumber(activityWindow, "days"),
    },
    live: normalizeLive(root.live ?? operations.counters),
    capacity: normalizeCapacity(root.capacity),
    staff: normalizeStaff(root.staff),
    activity: normalizeActivity(root.activity),
    attention: attentionRaw
      .map(normalizeAttention)
      .filter((item): item is OverviewAttentionItem => item != null),
    operationsAlerts: alertsRaw
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean),
    receivingSessions: receivingRaw
      .map(normalizeReceivingSession)
      .filter((item): item is OverviewSessionProgress => item != null),
    putawaySessions: putawayRaw
      .map(normalizePutawaySession)
      .filter((item): item is OverviewSessionProgress => item != null),
    pickingSessions: pickingRaw
      .map((item) => normalizeGenericSession(item, ["pickedTires", "expectedTires"]))
      .filter((item): item is OverviewSessionProgress => item != null),
    shippingSessions: shippingRaw
      .map((item) => normalizeGenericSession(item, ["shippedTires", "expectedTires"]))
      .filter((item): item is OverviewSessionProgress => item != null),
  };
}
