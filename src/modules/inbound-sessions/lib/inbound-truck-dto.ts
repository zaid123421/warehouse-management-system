import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import { normalizeArray } from "@/modules/inbound-sessions/lib/scheduling-dto";
import type {
  ApproveInboundTruckResult,
  CreateReceivingFromTruckResult,
  InboundTruck,
  InboundTruckRequestLink,
  PlanningPoolRequest,
  TransitTruck,
} from "@/modules/inbound-sessions/types/inbound-truck";

function normalizeRequestLink(raw: unknown): InboundTruckRequestLink | null {
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

function normalizeInboundTruck(raw: unknown): InboundTruck | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id =
    pickNumber(rec, "id") ||
    pickNumber(rec, "truckId") ||
    pickNumber(rec, "inboundTruckId");
  if (!id) return null;
  const requestsRaw = Array.isArray(rec.requests)
    ? rec.requests
    : Array.isArray(rec.assignedRequests)
      ? rec.assignedRequests
      : Array.isArray(rec.inboundRequests)
        ? rec.inboundRequests
        : [];
  return {
    id,
    label: pickString(rec, "label") || pickString(rec, "inboundTruckLabel"),
    status: str(rec.status),
    schedulingCellId: pickNumber(rec, "schedulingCellId") || undefined,
    receivingDay: pickString(rec, "receivingDay"),
    serviceDate: pickString(rec, "serviceDate"),
    capacityTires: pickNumber(rec, "capacityTires") || undefined,
    assignedTires: pickNumber(rec, "assignedTires") || undefined,
    requestCount: pickNumber(rec, "requestCount") || undefined,
    handoverCompleteCount: pickNumber(rec, "handoverCompleteCount") || undefined,
    receivingSessionId: pickNumber(rec, "receivingSessionId") || undefined,
    ready: rec.ready === true ? true : rec.ready === false ? false : undefined,
    version: pickNumber(rec, "version"),
    createdAt: pickString(rec, "createdAt"),
    assignedRequests: requestsRaw
      .map((item) => normalizeRequestLink(item))
      .filter((item): item is InboundTruckRequestLink => item != null),
  };
}

export function normalizeInboundTruckList(data: unknown): InboundTruck[] {
  return normalizeArray(data, normalizeInboundTruck);
}

export function normalizePlanningPoolRequest(raw: unknown): PlanningPoolRequest | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const inboundRequestId =
    pickNumber(rec, "inboundRequestId") || pickNumber(rec, "id");
  if (!inboundRequestId) return null;
  return {
    inboundRequestId,
    status: str(rec.status),
    dealerName: pickString(rec, "dealerName"),
    totalVolume:
      pickNumber(rec, "totalVolume") ||
      pickNumber(rec, "expectedTireCount") ||
      undefined,
    expectedTireCount: pickNumber(rec, "expectedTireCount") || undefined,
    receivingDay: pickString(rec, "receivingDay"),
    schedulingCellId: pickNumber(rec, "schedulingCellId") || undefined,
  };
}

export function normalizePlanningPoolList(data: unknown): PlanningPoolRequest[] {
  return normalizeArray(data, normalizePlanningPoolRequest);
}

export function normalizeInboundTruckDetail(data: unknown): InboundTruck | null {
  const payload = unwrapPayload(data);
  return normalizeInboundTruck(payload);
}

export function normalizeApproveInboundTruckResult(
  data: unknown,
): ApproveInboundTruckResult {
  const payload = unwrapPayload(data);
  const requestsRaw = Array.isArray(payload.requests) ? payload.requests : [];
  return {
    status: str(payload.status),
    requests: requestsRaw
      .map((item) => normalizeRequestLink(item))
      .filter((item): item is InboundTruckRequestLink => item != null),
  };
}

export function normalizeTransitTruck(raw: unknown): TransitTruck | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const truckId =
    pickNumber(rec, "truckId") ||
    pickNumber(rec, "id") ||
    pickNumber(rec, "inboundTruckId");
  if (!truckId) return null;
  return {
    truckId,
    label: pickString(rec, "label") || pickString(rec, "inboundTruckLabel"),
    status: str(rec.status),
    ready: rec.ready === true,
    serviceDate: pickString(rec, "serviceDate"),
    receivingDay: pickString(rec, "receivingDay"),
    assignedTires: pickNumber(rec, "assignedTires") || undefined,
    expectedTires: pickNumber(rec, "expectedTires") || undefined,
    receivingSessionId: pickNumber(rec, "receivingSessionId") || undefined,
    version: pickNumber(rec, "version"),
  };
}

export function normalizeTransitTruckList(data: unknown): TransitTruck[] {
  return normalizeArray(data, normalizeTransitTruck);
}

export function normalizeCreateReceivingFromTruckResult(
  data: unknown,
): CreateReceivingFromTruckResult | null {
  const payload = unwrapPayload(data);
  const rec = asRecord(payload);
  if (!rec) return null;
  const id = pickNumber(rec, "id") || pickNumber(rec, "receivingSessionId");
  if (!id) return null;
  return {
    id,
    status: str(rec.status),
    inboundTruckId:
      pickNumber(rec, "inboundTruckId") || pickNumber(rec, "truckId") || undefined,
    inboundTruckLabel:
      pickString(rec, "inboundTruckLabel") || pickString(rec, "label"),
    expectedTires: pickNumber(rec, "expectedTires"),
    receivedTires: pickNumber(rec, "receivedTires"),
  };
}
