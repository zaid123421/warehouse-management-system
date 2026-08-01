import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type {
  ApproveOutboundSchedulingCellResult,
  GeneratePickingSessionsResult,
  GeneratedPickingSession,
  OutboundSchedulingBoard,
  OutboundSchedulingCell,
  OutboundSchedulingCellDetail,
  OutboundSchedulingCellRequest,
} from "@/modules/outbound-sessions/types/scheduling";

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

function regionCityNameFrom(rec: Record<string, unknown>): string {
  return (
    pickString(rec, "regionCityName") ||
    pickString(rec, "regionProvinceName") ||
    ""
  );
}

function normalizeCellRequest(raw: unknown): OutboundSchedulingCellRequest | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const outboundRequestId =
    pickNumber(rec, "outboundRequestId") || pickNumber(rec, "id");
  if (!outboundRequestId) return null;
  return {
    outboundRequestId,
    status: str(rec.status),
    scheduleStatus: pickString(rec, "scheduleStatus"),
    dealerName: pickString(rec, "dealerName"),
    totalVolume: pickNumber(rec, "totalVolume") || undefined,
    deliveryDay: pickString(rec, "deliveryDay"),
    serviceDate: pickString(rec, "serviceDate"),
  };
}

function normalizeCell(raw: unknown): OutboundSchedulingCell | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const cellId = pickNumber(rec, "cellId") || pickNumber(rec, "id");
  if (!cellId) return null;
  const regionCityName = regionCityNameFrom(rec);
  return {
    cellId,
    deliveryDay: str(rec.deliveryDay),
    serviceDate: pickString(rec, "serviceDate"),
    regionCityId: pickNumber(rec, "regionCityId") || undefined,
    regionCityName: regionCityName || "—",
    regionProvinceId: pickNumber(rec, "regionProvinceId") || undefined,
    regionProvinceName: pickString(rec, "regionProvinceName"),
    totalVolume: pickNumber(rec, "totalVolume"),
    estimatedTrucks: pickNumber(rec, "estimatedTrucks"),
    status: str(rec.status),
    requestCount: pickNumber(rec, "requestCount"),
    cutoffAt: pickString(rec, "cutoffAt"),
    readyForApproval:
      rec.readyForApproval === true
        ? true
        : rec.readyForApproval === false
          ? false
          : undefined,
  };
}

export function normalizeOutboundSchedulingBoard(data: unknown): OutboundSchedulingBoard {
  const payload = unwrapPayload(data);
  const cellsRaw = Array.isArray(payload.cells)
    ? payload.cells
    : Array.isArray(data)
      ? data
      : [];
  return {
    warehouseId: pickNumber(payload, "warehouseId"),
    cells: cellsRaw
      .map((item) => normalizeCell(item))
      .filter((item): item is OutboundSchedulingCell => item != null),
  };
}

export function normalizeOutboundSchedulingCellDetail(
  data: unknown,
): OutboundSchedulingCellDetail | null {
  const payload = unwrapPayload(data);
  const cellId = pickNumber(payload, "cellId") || pickNumber(payload, "id");
  if (!cellId) return null;
  const requestsRaw = Array.isArray(payload.requests) ? payload.requests : [];
  const regionCityName = regionCityNameFrom(payload);
  return {
    cellId,
    deliveryDay: str(payload.deliveryDay),
    serviceDate: pickString(payload, "serviceDate"),
    regionCityId: pickNumber(payload, "regionCityId") || undefined,
    regionCityName: regionCityName || undefined,
    regionProvinceName: pickString(payload, "regionProvinceName"),
    totalVolume: pickNumber(payload, "totalVolume") || undefined,
    estimatedTrucks: pickNumber(payload, "estimatedTrucks") || undefined,
    status: str(payload.status),
    cutoffAt: pickString(payload, "cutoffAt"),
    readyForApproval:
      payload.readyForApproval === true
        ? true
        : payload.readyForApproval === false
          ? false
          : undefined,
    requests: requestsRaw
      .map((item) => normalizeCellRequest(item))
      .filter((item): item is OutboundSchedulingCellRequest => item != null),
  };
}

export function normalizeApproveOutboundSchedulingCellResult(
  data: unknown,
): ApproveOutboundSchedulingCellResult {
  const payload = unwrapPayload(data);
  const requestsRaw = Array.isArray(payload.requests) ? payload.requests : [];
  return {
    status: str(payload.status),
    requests: requestsRaw
      .map((item) => normalizeCellRequest(item))
      .filter((item): item is OutboundSchedulingCellRequest => item != null),
  };
}

function normalizeGeneratedPickingSession(raw: unknown): GeneratedPickingSession | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const pickingSessionId =
    pickNumber(rec, "pickingSessionId") || pickNumber(rec, "id");
  if (!pickingSessionId) return null;
  return {
    pickingSessionId,
    deliveryDay: pickString(rec, "deliveryDay"),
    serviceDate: pickString(rec, "serviceDate"),
    outboundRequestCount: pickNumber(rec, "outboundRequestCount") || undefined,
    expectedTires: pickNumber(rec, "expectedTires") || undefined,
    status: str(rec.status),
  };
}

export function normalizeGeneratePickingSessionsResult(
  data: unknown,
): GeneratePickingSessionsResult {
  const payload = unwrapPayload(data);
  const sessionsRaw = Array.isArray(payload.sessions) ? payload.sessions : [];
  return {
    sessions: sessionsRaw
      .map((item) => normalizeGeneratedPickingSession(item))
      .filter((item): item is GeneratedPickingSession => item != null),
  };
}
