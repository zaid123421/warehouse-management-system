import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import { normalizePutawaySession } from "@/modules/inbound-sessions/lib/putaway-session-dto";
import { normalizeReceivingSession } from "@/modules/inbound-sessions/lib/receiving-session-dto";
import type { InboundRequest } from "@/modules/inbound-sessions/types/inbound-request";
import type {
  OperationsAlert,
  OperationsCounters,
  OperationsDashboard,
  OperationsDashboardPutawaySession,
  OperationsDashboardReceivingSession,
} from "@/modules/inbound-sessions/types/operations-dashboard";

function normalizeInboundRequest(raw: unknown): InboundRequest | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id") || pickNumber(rec, "inboundRequestId");
  if (!id) return null;
  const expectedTireCount =
    pickNumber(rec, "expectedTireCount") ||
    pickNumber(rec, "totalVolume") ||
    pickNumber(rec, "tiresCount");
  return {
    id,
    dealerId: pickNumber(rec, "dealerId") || undefined,
    dealerName: pickString(rec, "dealerName"),
    receivingDay: pickString(rec, "receivingDay"),
    status: str(rec.status),
    expectedTireCount,
    receivedTireCount: pickNumber(rec, "receivedTireCount") || undefined,
    storedTireCount: pickNumber(rec, "storedTireCount") || undefined,
    lines: [],
  };
}

function normalizeAlert(raw: unknown): OperationsAlert | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  return {
    type: pickString(rec, "type"),
    message: pickString(rec, "message"),
    severity: pickString(rec, "severity"),
  };
}

function normalizeCounters(raw: unknown): OperationsCounters {
  const rec = asRecord(raw) ?? {};
  return {
    activeInboundRequestCount: pickNumber(rec, "activeInboundRequestCount"),
    totalExpectedTires: pickNumber(rec, "totalExpectedTires"),
    totalReceivedTires: pickNumber(rec, "totalReceivedTires"),
    totalStoredTires: pickNumber(rec, "totalStoredTires"),
    reservedLineCount: pickNumber(rec, "reservedLineCount"),
    expiredReservationCount: pickNumber(rec, "expiredReservationCount"),
    receivingExceptionScanCount: pickNumber(rec, "receivingExceptionScanCount"),
    putawayExceptionScanCount: pickNumber(rec, "putawayExceptionScanCount"),
  };
}

function normalizeDashboardReceivingSession(
  raw: unknown,
): OperationsDashboardReceivingSession | null {
  const normalized = normalizeReceivingSession(raw);
  if (!normalized) {
    const rec = asRecord(raw);
    if (!rec) return null;
    const sessionId = pickNumber(rec, "sessionId") || pickNumber(rec, "id");
    if (!sessionId) return null;
    const expectedTires = pickNumber(rec, "expectedTires");
    const receivedTires = pickNumber(rec, "receivedTires");
    return {
      sessionId,
      id: sessionId,
      status: str(rec.status),
      expectedTires,
      receivedTires,
      progressPercent:
        pickNumber(rec, "progressPercent") ||
        (expectedTires > 0 ? Math.round((receivedTires / expectedTires) * 100) : 0),
      assignedStaffCount: pickNumber(rec, "assignedStaffCount") || undefined,
      exceptionScanCount: pickNumber(rec, "exceptionScanCount") || undefined,
    };
  }
  return {
    sessionId: normalized.id,
    ...normalized,
  };
}

function normalizeDashboardPutawaySession(
  raw: unknown,
): OperationsDashboardPutawaySession | null {
  const normalized = normalizePutawaySession(raw);
  if (!normalized) {
    const rec = asRecord(raw);
    if (!rec) return null;
    const sessionId = pickNumber(rec, "sessionId") || pickNumber(rec, "id");
    if (!sessionId) return null;
    const tireCount = pickNumber(rec, "tireCount");
    const completedCount = pickNumber(rec, "completedCount");
    return {
      sessionId,
      zoneId: pickNumber(rec, "zoneId") || undefined,
      zoneName: pickString(rec, "zoneName"),
      status: str(rec.status),
      tireCount,
      completedCount,
      progressPercent:
        pickNumber(rec, "progressPercent") ||
        (tireCount > 0 ? Math.round((completedCount / tireCount) * 100) : 0),
      assignedStaffCount: pickNumber(rec, "assignedStaffCount") || undefined,
      exceptionScanCount: pickNumber(rec, "exceptionScanCount") || undefined,
    };
  }
  return {
    sessionId: normalized.id,
    zoneId: normalized.zoneId,
    zoneName: normalized.zoneName,
    status: normalized.status,
    tireCount: normalized.tireCount,
    completedCount: normalized.completedCount,
    progressPercent: normalized.progressPercent,
    assignedStaffCount: normalized.assignedStaffCount,
    exceptionScanCount: normalized.exceptionScanCount,
  };
}

export function normalizeOperationsDashboard(data: unknown): OperationsDashboard {
  const payload = unwrapPayload(data);
  const alertsRaw = Array.isArray(payload.alerts) ? payload.alerts : [];
  const receivingRaw = Array.isArray(payload.receivingSessions)
    ? payload.receivingSessions
    : [];
  const putawayRaw = Array.isArray(payload.putawaySessions) ? payload.putawaySessions : [];
  const attentionRaw = Array.isArray(payload.attentionInboundRequests)
    ? payload.attentionInboundRequests
    : [];
  return {
    warehouseId: pickNumber(payload, "warehouseId"),
    counters: normalizeCounters(payload.counters),
    alerts: alertsRaw
      .map((item) => normalizeAlert(item))
      .filter((item): item is OperationsAlert => item != null),
    receivingSessions: receivingRaw
      .map((item) => normalizeDashboardReceivingSession(item))
      .filter((item): item is OperationsDashboardReceivingSession => item != null),
    putawaySessions: putawayRaw
      .map((item) => normalizeDashboardPutawaySession(item))
      .filter((item): item is OperationsDashboardPutawaySession => item != null),
    attentionInboundRequests: attentionRaw
      .map((item) => normalizeInboundRequest(item))
      .filter((item): item is NonNullable<ReturnType<typeof normalizeInboundRequest>> =>
        item != null,
      ),
  };
}
