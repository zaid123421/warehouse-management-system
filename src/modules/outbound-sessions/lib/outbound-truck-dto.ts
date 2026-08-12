import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import { normalizeArray } from "@/modules/outbound-sessions/lib/scheduling-dto";
import type {
  ApproveOutboundTruckResult,
  ConfirmOutboundTruckPlanResult,
  CreateShippingFromTruckResult,
  OutboundTruck,
  OutboundTruckRequestLink,
  OutboundPlanningPoolRequest,
  ReadyToShipTruck,
} from "@/modules/outbound-sessions/types/outbound-truck";

function normalizeRequestLink(raw: unknown): OutboundTruckRequestLink | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const outboundRequestId =
    pickNumber(rec, "outboundRequestId") || pickNumber(rec, "id");
  if (!outboundRequestId) return null;
  return {
    outboundRequestId,
    status: str(rec.status),
    dealerName: pickString(rec, "dealerName"),
    expectedTireCount:
      pickNumber(rec, "expectedTireCount") ||
      pickNumber(rec, "totalVolume") ||
      undefined,
  };
}

function normalizeOutboundTruck(raw: unknown): OutboundTruck | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id =
    pickNumber(rec, "id") ||
    pickNumber(rec, "truckId") ||
    pickNumber(rec, "outboundTruckId");
  if (!id) return null;
  const requestsRaw = Array.isArray(rec.requests)
    ? rec.requests
    : Array.isArray(rec.assignedRequests)
      ? rec.assignedRequests
      : Array.isArray(rec.outboundRequests)
        ? rec.outboundRequests
        : [];
  return {
    id,
    label: pickString(rec, "label") || pickString(rec, "outboundTruckLabel"),
    status: str(rec.status),
    schedulingCellId: pickNumber(rec, "schedulingCellId") || undefined,
    deliveryDay: pickString(rec, "deliveryDay"),
    serviceDate: pickString(rec, "serviceDate"),
    capacityTires: pickNumber(rec, "capacityTires") || undefined,
    assignedTires: pickNumber(rec, "assignedTires") || undefined,
    requestCount: pickNumber(rec, "requestCount") || undefined,
    shippingSessionId: pickNumber(rec, "shippingSessionId") || undefined,
    ready: rec.ready === true ? true : rec.ready === false ? false : undefined,
    createdAt: pickString(rec, "createdAt"),
    approvedAt: pickString(rec, "approvedAt"),
    version: pickNumber(rec, "version"),
    assignedRequests: requestsRaw
      .map((item) => normalizeRequestLink(item))
      .filter((item): item is OutboundTruckRequestLink => item != null),
  };
}

export function normalizeOutboundTruckList(data: unknown): OutboundTruck[] {
  return normalizeArray(data, normalizeOutboundTruck);
}

export function normalizeOutboundPlanningPoolRequest(
  raw: unknown,
): OutboundPlanningPoolRequest | null {
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
    totalVolume:
      pickNumber(rec, "totalVolume") ||
      pickNumber(rec, "expectedTireCount") ||
      undefined,
    expectedTireCount:
      pickNumber(rec, "expectedTireCount") ||
      pickNumber(rec, "totalVolume") ||
      undefined,
    deliveryDay: pickString(rec, "deliveryDay"),
    serviceDate: pickString(rec, "serviceDate"),
    regionCityId: pickNumber(rec, "regionCityId") || undefined,
    regionCityName: pickString(rec, "regionCityName"),
    schedulingCellId: pickNumber(rec, "schedulingCellId") || undefined,
  };
}

export function normalizeOutboundPlanningPoolList(
  data: unknown,
): OutboundPlanningPoolRequest[] {
  return normalizeArray(data, normalizeOutboundPlanningPoolRequest);
}

export function normalizeOutboundTruckDetail(data: unknown): OutboundTruck | null {
  const payload = unwrapPayload(data);
  return normalizeOutboundTruck(payload);
}

export function normalizeApproveOutboundTruckResult(
  data: unknown,
): ApproveOutboundTruckResult {
  const payload = unwrapPayload(data);
  const requestsRaw = Array.isArray(payload.requests) ? payload.requests : [];
  return {
    status: str(payload.status),
    requests: requestsRaw
      .map((item) => normalizeRequestLink(item))
      .filter((item): item is OutboundTruckRequestLink => item != null),
  };
}

export function normalizeConfirmOutboundTruckPlanResult(
  data: unknown,
): ConfirmOutboundTruckPlanResult {
  const payload = asRecord(unwrapPayload(data)) ?? asRecord(data);
  const trucksRaw = Array.isArray(payload?.trucks) ? payload.trucks : [];
  const pickingRaw = asRecord(payload?.pickingSessions);
  const sessionsRaw = Array.isArray(pickingRaw?.sessions) ? pickingRaw.sessions : [];
  return {
    trucks: trucksRaw
      .map((item) => normalizeOutboundTruck(item))
      .filter((item): item is OutboundTruck => item != null),
    pickingSessionCount: sessionsRaw.length,
  };
}

export function normalizeReadyToShipTruck(raw: unknown): ReadyToShipTruck | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const truckId =
    pickNumber(rec, "truckId") ||
    pickNumber(rec, "id") ||
    pickNumber(rec, "outboundTruckId");
  if (!truckId) return null;
  return {
    truckId,
    label: pickString(rec, "label") || pickString(rec, "outboundTruckLabel"),
    status: str(rec.status),
    ready: rec.ready === true,
    serviceDate: pickString(rec, "serviceDate"),
    deliveryDay: pickString(rec, "deliveryDay"),
    assignedTires: pickNumber(rec, "assignedTires") || undefined,
    capacityTires: pickNumber(rec, "capacityTires") || undefined,
    requestCount: pickNumber(rec, "requestCount") || undefined,
    shippingSessionId: pickNumber(rec, "shippingSessionId") || undefined,
    version: pickNumber(rec, "version"),
  };
}

export function normalizeReadyToShipTruckList(data: unknown): ReadyToShipTruck[] {
  return normalizeArray(data, normalizeReadyToShipTruck);
}

export function normalizeCreateShippingFromTruckResult(
  data: unknown,
): CreateShippingFromTruckResult | null {
  const payload = unwrapPayload(data);
  const rec = asRecord(payload);
  if (!rec) return null;
  const id = pickNumber(rec, "id") || pickNumber(rec, "shippingSessionId");
  if (!id) return null;
  return {
    id,
    status: str(rec.status),
    outboundTruckId:
      pickNumber(rec, "outboundTruckId") || pickNumber(rec, "truckId") || undefined,
    outboundTruckLabel:
      pickString(rec, "outboundTruckLabel") || pickString(rec, "label"),
    serviceDate: pickString(rec, "serviceDate"),
    expectedTires: pickNumber(rec, "expectedTires"),
    shippedTires: pickNumber(rec, "shippedTires"),
  };
}
