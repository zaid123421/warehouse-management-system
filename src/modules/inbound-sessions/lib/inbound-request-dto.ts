import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type {
  InboundRequest,
  InboundRequestLine,
} from "@/modules/inbound-sessions/types/inbound-request";
import { normalizeArray } from "@/modules/inbound-sessions/lib/scheduling-dto";

function normalizeInboundRequestLine(raw: unknown): InboundRequestLine | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  return {
    tireId: pickNumber(rec, "tireId") || undefined,
    tireUniqueId: pickString(rec, "tireUniqueId"),
    reservedPositionId: pickNumber(rec, "reservedPositionId") || undefined,
    reservedPositionBarcode: pickString(rec, "reservedPositionBarcode"),
    status: str(rec.status) || str(rec.lineStatus),
    lineStatus: pickString(rec, "lineStatus"),
    assignedStaffUserId: pickNumber(rec, "assignedStaffUserId") || undefined,
  };
}

export function normalizeInboundRequest(raw: unknown): InboundRequest | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id") || pickNumber(rec, "inboundRequestId");
  if (!id) return null;
  const linesRaw = Array.isArray(rec.lines) ? rec.lines : [];
  return {
    id,
    status: str(rec.status),
    scheduleStatus: pickString(rec, "scheduleStatus"),
    receivingDay: pickString(rec, "receivingDay"),
    expectedTireCount:
      pickNumber(rec, "expectedTireCount") || pickNumber(rec, "expectedTires"),
    receivedTireCount: pickNumber(rec, "receivedTireCount") || undefined,
    storedTireCount: pickNumber(rec, "storedTireCount") || undefined,
    dealerName: pickString(rec, "dealerName"),
    dealerId: pickNumber(rec, "dealerId") || undefined,
    shipmentRequestId: pickNumber(rec, "shipmentRequestId") || undefined,
    acceptedAt: pickString(rec, "acceptedAt"),
    completedAt: pickString(rec, "completedAt"),
    createdAt: pickString(rec, "createdAt"),
    lines: linesRaw
      .map((item) => normalizeInboundRequestLine(item))
      .filter((item): item is InboundRequestLine => item != null),
  };
}

export function normalizeInboundRequestList(data: unknown): InboundRequest[] {
  return normalizeArray(data, normalizeInboundRequest);
}

export function normalizeInboundRequestDetail(data: unknown): InboundRequest | null {
  const payload = unwrapPayload(data);
  return normalizeInboundRequest(payload);
}
