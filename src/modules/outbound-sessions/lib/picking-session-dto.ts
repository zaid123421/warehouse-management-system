import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import { normalizeArray } from "@/modules/outbound-sessions/lib/scheduling-dto";
import type {
  PickingSession,
  PickingSessionLine,
  PickingSessionOutboundLink,
} from "@/modules/outbound-sessions/types/picking-session";

function normalizeStaffIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((id) => pickNumber({ v: id }, "v")).filter((id) => id > 0);
}

function normalizeOutboundLink(raw: unknown): PickingSessionOutboundLink | null {
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

function normalizeLine(raw: unknown): PickingSessionLine | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  return {
    tireId: pickNumber(rec, "tireId") || undefined,
    tireUniqueId: pickString(rec, "tireUniqueId"),
    lineStatus: pickString(rec, "lineStatus") || pickString(rec, "status"),
    status: pickString(rec, "status"),
    locationBarcode: pickString(rec, "locationBarcode"),
    assignedStaffUserId: pickNumber(rec, "assignedStaffUserId") || undefined,
  };
}

export function normalizePickingSession(raw: unknown): PickingSession | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id") || pickNumber(rec, "pickingSessionId") || pickNumber(rec, "sessionId");
  if (!id) return null;
  const outboundRaw = Array.isArray(rec.outboundRequests) ? rec.outboundRequests : [];
  const linesRaw = Array.isArray(rec.lines) ? rec.lines : Array.isArray(rec.manifest) ? rec.manifest : [];
  const expectedTires = pickNumber(rec, "expectedTires") || pickNumber(rec, "tireCount");
  const pickedTires =
    pickNumber(rec, "pickedTires") ||
    pickNumber(rec, "completedCount") ||
    pickNumber(rec, "pickedCount");
  const progressPercent =
    pickNumber(rec, "progressPercent") ||
    (expectedTires > 0 ? Math.round((pickedTires / expectedTires) * 100) : 0);
  return {
    id,
    status: str(rec.status),
    deliveryDay: pickString(rec, "deliveryDay"),
    serviceDate: pickString(rec, "serviceDate"),
    dealerId: pickNumber(rec, "dealerId") || undefined,
    dealerName: pickString(rec, "dealerName"),
    outboundTruckId: pickNumber(rec, "outboundTruckId") || undefined,
    outboundTruckLabel: pickString(rec, "outboundTruckLabel"),
    expectedTires,
    pickedTires: pickedTires || undefined,
    completedCount: pickNumber(rec, "completedCount") || undefined,
    progressPercent,
    outboundRequestCount:
      pickNumber(rec, "outboundRequestCount") || outboundRaw.length || undefined,
    assignedStaffUserIds: normalizeStaffIds(rec.assignedStaffUserIds),
    assignedStaffCount:
      pickNumber(rec, "assignedStaffCount") ||
      normalizeStaffIds(rec.assignedStaffUserIds).length ||
      undefined,
    exceptionScanCount: pickNumber(rec, "exceptionScanCount") || undefined,
    startedAt: pickString(rec, "startedAt"),
    approvedAt: pickString(rec, "approvedAt"),
    completedAt: pickString(rec, "completedAt"),
    dispatchedAt: pickString(rec, "dispatchedAt"),
    createdAt: pickString(rec, "createdAt"),
    version: pickNumber(rec, "version"),
    outboundRequests: outboundRaw
      .map((item) => normalizeOutboundLink(item))
      .filter((item): item is PickingSessionOutboundLink => item != null),
    lines: linesRaw
      .map((item) => normalizeLine(item))
      .filter((item): item is PickingSessionLine => item != null),
  };
}

export function normalizePickingSessionList(data: unknown): PickingSession[] {
  return normalizeArray(data, normalizePickingSession);
}

export function normalizePickingSessionDetail(data: unknown): PickingSession | null {
  const payload = unwrapPayload(data);
  return normalizePickingSession(payload);
}
