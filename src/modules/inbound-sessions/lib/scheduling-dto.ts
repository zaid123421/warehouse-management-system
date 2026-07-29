import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type {
  ApproveSchedulingCellResult,
  GenerateReceivingSessionsResult,
  GeneratedReceivingSession,
  SchedulingBoard,
  SchedulingCell,
  SchedulingCellDetail,
  SchedulingCellRequest,
} from "@/modules/inbound-sessions/types/scheduling";

function normalizeSchedulingCellRequest(raw: unknown): SchedulingCellRequest | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const inboundRequestId = pickNumber(rec, "inboundRequestId") || pickNumber(rec, "id");
  if (!inboundRequestId) return null;
  return {
    inboundRequestId,
    status: str(rec.status),
    scheduleStatus: pickString(rec, "scheduleStatus"),
    dealerName: pickString(rec, "dealerName"),
    totalVolume: pickNumber(rec, "totalVolume") || undefined,
    receivingDay: pickString(rec, "receivingDay"),
  };
}

function normalizeSchedulingCell(raw: unknown): SchedulingCell | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const cellId = pickNumber(rec, "cellId") || pickNumber(rec, "id");
  if (!cellId) return null;
  return {
    cellId,
    receivingDay: str(rec.receivingDay),
    regionProvinceId: pickNumber(rec, "regionProvinceId") || undefined,
    regionProvinceName: str(rec.regionProvinceName),
    totalVolume: pickNumber(rec, "totalVolume"),
    estimatedTrucks: pickNumber(rec, "estimatedTrucks"),
    status: str(rec.status),
    requestCount: pickNumber(rec, "requestCount"),
  };
}

export function normalizeSchedulingBoard(data: unknown): SchedulingBoard {
  const payload = unwrapPayload(data);
  const cellsRaw = Array.isArray(payload.cells)
    ? payload.cells
    : Array.isArray(data)
      ? data
      : [];
  return {
    warehouseId: pickNumber(payload, "warehouseId"),
    cells: cellsRaw
      .map((item) => normalizeSchedulingCell(item))
      .filter((item): item is SchedulingCell => item != null),
  };
}

export function normalizeSchedulingCellDetail(data: unknown): SchedulingCellDetail | null {
  const payload = unwrapPayload(data);
  const cellId = pickNumber(payload, "cellId") || pickNumber(payload, "id");
  if (!cellId) return null;
  const requestsRaw = Array.isArray(payload.requests) ? payload.requests : [];
  return {
    cellId,
    receivingDay: str(payload.receivingDay),
    regionProvinceName: pickString(payload, "regionProvinceName"),
    totalVolume: pickNumber(payload, "totalVolume") || undefined,
    estimatedTrucks: pickNumber(payload, "estimatedTrucks") || undefined,
    status: str(payload.status),
    requests: requestsRaw
      .map((item) => normalizeSchedulingCellRequest(item))
      .filter((item): item is SchedulingCellRequest => item != null),
  };
}

export function normalizeApproveSchedulingCellResult(
  data: unknown,
): ApproveSchedulingCellResult {
  const payload = unwrapPayload(data);
  const requestsRaw = Array.isArray(payload.requests) ? payload.requests : [];
  return {
    status: str(payload.status),
    requests: requestsRaw
      .map((item) => normalizeSchedulingCellRequest(item))
      .filter((item): item is SchedulingCellRequest => item != null),
  };
}

function normalizeGeneratedReceivingSession(raw: unknown): GeneratedReceivingSession | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const receivingSessionId =
    pickNumber(rec, "receivingSessionId") || pickNumber(rec, "id");
  if (!receivingSessionId) return null;
  return {
    receivingSessionId,
    receivingDay: pickString(rec, "receivingDay"),
    inboundRequestCount: pickNumber(rec, "inboundRequestCount") || undefined,
    expectedTires: pickNumber(rec, "expectedTires") || undefined,
    status: str(rec.status),
  };
}

export function normalizeGenerateReceivingSessionsResult(
  data: unknown,
): GenerateReceivingSessionsResult {
  const payload = unwrapPayload(data);
  const sessionsRaw = Array.isArray(payload.sessions) ? payload.sessions : [];
  return {
    sessions: sessionsRaw
      .map((item) => normalizeGeneratedReceivingSession(item))
      .filter((item): item is GeneratedReceivingSession => item != null),
  };
}

export function normalizeArray<T>(
  data: unknown,
  normalizeItem: (raw: unknown) => T | null,
): T[] {
  if (Array.isArray(data)) {
    return data.map(normalizeItem).filter((item): item is T => item != null);
  }
  const payload = unwrapPayload(data);
  if (Array.isArray(payload)) {
    return payload.map(normalizeItem).filter((item): item is T => item != null);
  }
  const content = payload.content;
  if (Array.isArray(content)) {
    return content.map(normalizeItem).filter((item): item is T => item != null);
  }
  return [];
}
