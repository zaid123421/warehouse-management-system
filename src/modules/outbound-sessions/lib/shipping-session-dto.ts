import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import { normalizeArray } from "@/modules/outbound-sessions/lib/scheduling-dto";
import type {
  GeneratedShippingSession,
  GenerateShippingSessionsResult,
  ShippingSession,
  ShippingSessionLine,
  ShippingSessionOutboundLink,
} from "@/modules/outbound-sessions/types/shipping-session";

function normalizeStaffIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((id) => pickNumber({ v: id }, "v")).filter((id) => id > 0);
}

function normalizeOutboundLink(raw: unknown): ShippingSessionOutboundLink | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const outboundRequestId =
    pickNumber(rec, "outboundRequestId") || pickNumber(rec, "id");
  if (!outboundRequestId) return null;
  return {
    outboundRequestId,
    status: str(rec.status),
    dealerName: pickString(rec, "dealerName"),
    totalVolume: pickNumber(rec, "totalVolume") || undefined,
  };
}

function normalizeLine(raw: unknown): ShippingSessionLine | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  return {
    outboundRequestLineId: pickNumber(rec, "outboundRequestLineId") || undefined,
    tireId: pickNumber(rec, "tireId") || undefined,
    tireUniqueId: pickString(rec, "tireUniqueId"),
    customerName: pickString(rec, "customerName"),
    vehicleLabel: pickString(rec, "vehicleLabel") || pickString(rec, "vehicleName"),
    dealerName: pickString(rec, "dealerName"),
    lineStatus: pickString(rec, "lineStatus") || pickString(rec, "status"),
    status: pickString(rec, "status"),
    scannedAt: pickString(rec, "scannedAt"),
  };
}

export function normalizeShippingSession(raw: unknown): ShippingSession | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id =
    pickNumber(rec, "id") ||
    pickNumber(rec, "shippingSessionId") ||
    pickNumber(rec, "sessionId");
  if (!id) return null;
  const outboundRaw = Array.isArray(rec.outboundRequests) ? rec.outboundRequests : [];
  const linesRaw = Array.isArray(rec.lines)
    ? rec.lines
    : Array.isArray(rec.manifest)
      ? rec.manifest
      : [];
  const expectedTires = pickNumber(rec, "expectedTires") || pickNumber(rec, "tireCount");
  const shippedTires = pickNumber(rec, "shippedTires");
  const missingTires = pickNumber(rec, "missingTires");
  const progressPercent =
    pickNumber(rec, "progressPercent") ||
    (expectedTires > 0
      ? Math.round(((shippedTires + missingTires) / expectedTires) * 100)
      : 0);
  return {
    id,
    status: str(rec.status),
    deliveryDay: pickString(rec, "deliveryDay"),
    serviceDate: pickString(rec, "serviceDate"),
    outboundTruckId:
      pickNumber(rec, "outboundTruckId") || pickNumber(rec, "truckId") || undefined,
    outboundTruckLabel:
      pickString(rec, "outboundTruckLabel") || pickString(rec, "label"),
    expectedTires,
    shippedTires,
    missingTires,
    progressPercent,
    outboundRequestCount:
      pickNumber(rec, "outboundRequestCount") || outboundRaw.length || undefined,
    assignedStaffUserIds: normalizeStaffIds(rec.assignedStaffUserIds),
    assignedStaffCount:
      pickNumber(rec, "assignedStaffCount") ||
      normalizeStaffIds(rec.assignedStaffUserIds).length ||
      undefined,
    startedAt: pickString(rec, "startedAt"),
    approvedAt: pickString(rec, "approvedAt"),
    completedAt: pickString(rec, "completedAt"),
    createdAt: pickString(rec, "createdAt"),
    version: pickNumber(rec, "version"),
    outboundRequests: outboundRaw
      .map((item) => normalizeOutboundLink(item))
      .filter((item): item is ShippingSessionOutboundLink => item != null),
    lines: linesRaw
      .map((item) => normalizeLine(item))
      .filter((item): item is ShippingSessionLine => item != null),
  };
}

export function normalizeShippingSessionList(data: unknown): ShippingSession[] {
  return normalizeArray(data, normalizeShippingSession);
}

export function normalizeShippingSessionDetail(data: unknown): ShippingSession | null {
  const payload = unwrapPayload(data);
  return normalizeShippingSession(payload);
}

function normalizeGeneratedSession(raw: unknown): GeneratedShippingSession | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const shippingSessionId =
    pickNumber(rec, "shippingSessionId") || pickNumber(rec, "id");
  if (!shippingSessionId) return null;
  return {
    shippingSessionId,
    deliveryDay: pickString(rec, "deliveryDay"),
    outboundRequestCount: pickNumber(rec, "outboundRequestCount") || undefined,
    expectedTires: pickNumber(rec, "expectedTires") || undefined,
    status: str(rec.status),
  };
}

export function normalizeGenerateShippingSessionsResult(
  data: unknown,
): GenerateShippingSessionsResult {
  const payload = unwrapPayload(data);
  const sessionsRaw = Array.isArray(payload.sessions) ? payload.sessions : [];
  return {
    sessions: sessionsRaw
      .map((item) => normalizeGeneratedSession(item))
      .filter((item): item is GeneratedShippingSession => item != null),
  };
}
