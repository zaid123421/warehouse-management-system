import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type {
  ReceivingSession,
  ReceivingSessionInboundLink,
} from "@/modules/inbound-sessions/types/receiving-session";
import { normalizeArray } from "@/modules/inbound-sessions/lib/scheduling-dto";

function normalizeStaffIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((id) => pickNumber({ v: id }, "v")).filter((id) => id > 0);
}

function normalizeReceivingInboundLink(raw: unknown): ReceivingSessionInboundLink | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const inboundRequestId =
    pickNumber(rec, "inboundRequestId") || pickNumber(rec, "id");
  if (!inboundRequestId) return null;
  return {
    inboundRequestId,
    status: str(rec.status),
    dealerName: pickString(rec, "dealerName"),
  };
}

export function normalizeReceivingSession(raw: unknown): ReceivingSession | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id") || pickNumber(rec, "sessionId");
  if (!id) return null;
  const inboundRaw = Array.isArray(rec.inboundRequests) ? rec.inboundRequests : [];
  const expectedTires = pickNumber(rec, "expectedTires");
  const receivedTires = pickNumber(rec, "receivedTires");
  const progressPercent =
    pickNumber(rec, "progressPercent") ||
    (expectedTires > 0 ? Math.round((receivedTires / expectedTires) * 100) : 0);
  return {
    id,
    status: str(rec.status),
    expectedTires,
    receivedTires,
    progressPercent,
    assignedStaffUserIds: normalizeStaffIds(rec.assignedStaffUserIds),
    assignedStaffCount:
      pickNumber(rec, "assignedStaffCount") ||
      normalizeStaffIds(rec.assignedStaffUserIds).length ||
      undefined,
    exceptionScanCount: pickNumber(rec, "exceptionScanCount") || undefined,
    startedAt: pickString(rec, "startedAt"),
    approvedAt: pickString(rec, "approvedAt"),
    completedAt: pickString(rec, "completedAt"),
    createdAt: pickString(rec, "createdAt"),
    inboundRequests: inboundRaw
      .map((item) => normalizeReceivingInboundLink(item))
      .filter((item): item is ReceivingSessionInboundLink => item != null),
  };
}

export function normalizeReceivingSessionList(data: unknown): ReceivingSession[] {
  return normalizeArray(data, normalizeReceivingSession);
}

export function normalizeReceivingSessionDetail(data: unknown): ReceivingSession | null {
  const payload = unwrapPayload(data);
  return normalizeReceivingSession(payload);
}
