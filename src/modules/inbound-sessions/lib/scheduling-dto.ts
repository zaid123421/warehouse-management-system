import {
  asRecord,
  bool,
  pickNumber,
  pickString,
  str,
  unwrapPayload,
} from "@/shared/lib/dto-utils";
import type {
  GenerateReceivingSessionsResult,
  GeneratedReceivingSession,
  SchedulingBoard,
  SchedulingCell,
  SchedulingCellDealer,
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
    shipmentRequestId: pickNumber(rec, "shipmentRequestId") || undefined,
    dealerId: pickNumber(rec, "dealerId") || undefined,
    dealerName: pickString(rec, "dealerName"),
    serviceDate: pickString(rec, "serviceDate"),
    receivingDay: pickString(rec, "receivingDay"),
    regionCityId: pickNumber(rec, "regionCityId") || undefined,
    regionCityName: pickString(rec, "regionCityName"),
    totalVolume: pickNumber(rec, "totalVolume") || undefined,
    status: str(rec.status),
    scheduleStatus: pickString(rec, "scheduleStatus"),
  };
}

function normalizeSchedulingCellDealer(raw: unknown): SchedulingCellDealer | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const dealerId = pickNumber(rec, "dealerId");
  if (!dealerId) return null;
  return {
    dealerId,
    dealerName: pickString(rec, "dealerName") || "—",
    requestCount: pickNumber(rec, "requestCount"),
    totalVolume: pickNumber(rec, "totalVolume"),
    approved: bool(rec.approved),
    readyForApproval: bool(rec.readyForApproval),
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
    regionProvinceId:
      pickNumber(rec, "regionCityId") ||
      pickNumber(rec, "regionProvinceId") ||
      undefined,
    regionProvinceName:
      pickString(rec, "regionCityName") ||
      pickString(rec, "regionProvinceName") ||
      "—",
    totalVolume: pickNumber(rec, "totalVolume"),
    estimatedTrucks: pickNumber(rec, "estimatedTrucks"),
    status: str(rec.status),
    requestCount:
      pickNumber(rec, "requestCount") ||
      pickNumber(rec, "totalDealerCount") ||
      0,
    version: pickNumber(rec, "version"),
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
  const dealersRaw = Array.isArray(payload.dealers) ? payload.dealers : [];
  const requestsRaw = Array.isArray(payload.requests) ? payload.requests : [];
  const regionCityName =
    pickString(payload, "regionCityName") ||
    pickString(payload, "regionProvinceName");
  return {
    cellId,
    serviceDate: pickString(payload, "serviceDate"),
    receivingDay: str(payload.receivingDay),
    regionCityId: pickNumber(payload, "regionCityId") || undefined,
    regionCityName,
    regionProvinceName: regionCityName,
    totalVolume: pickNumber(payload, "totalVolume"),
    estimatedTrucks: pickNumber(payload, "estimatedTrucks"),
    status: str(payload.status),
    approvedDealerCount: pickNumber(payload, "approvedDealerCount"),
    totalDealerCount: pickNumber(payload, "totalDealerCount"),
    cutoffAt: pickString(payload, "cutoffAt"),
    readyForApproval: bool(payload.readyForApproval),
    version: pickNumber(payload, "version"),
    dealers: dealersRaw
      .map((item) => normalizeSchedulingCellDealer(item))
      .filter((item): item is SchedulingCellDealer => item != null),
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
