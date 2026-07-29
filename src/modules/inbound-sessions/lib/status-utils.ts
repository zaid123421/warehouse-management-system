import type { InboundRequestStatus } from "@/modules/inbound-sessions/types/inbound-request";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  PLANNED: "default",
  SCHEDULED: "default",
  PENDING_SCHEDULING: "warning",
  PENDING_ACCEPTANCE: "warning",
  PENDING_APPROVAL: "warning",
  RESERVATIONS_COMPLETE: "success",
  RECEIVING_SESSION_PENDING: "warning",
  RECEIVING_APPROVED: "success",
  RECEIVING_IN_PROGRESS: "default",
  RECEIVING_COMPLETED: "success",
  PARTIALLY_RECEIVED: "warning",
  PUTAWAY_APPROVED: "success",
  APPROVED: "success",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELLED: "danger",
  EXPIRED_RESERVATION: "danger",
  RESERVED: "default",
  STORED: "success",
  MISSING: "danger",
};

export function getStatusVariant(status: string): "default" | "success" | "warning" | "danger" | "muted" {
  return STATUS_VARIANT[status] ?? "muted";
}

export function formatDayLabel(day: string): string {
  if (!day) return "—";
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export function canAcceptInboundRequest(status: string): boolean {
  return status === "PENDING_ACCEPTANCE";
}

export function canRejectInboundRequest(status: string): boolean {
  return status === "PENDING_ACCEPTANCE";
}

export function canApproveReceivingSession(status: string): boolean {
  return status === "PENDING_APPROVAL";
}

export function canAssignReceivingSession(status: string): boolean {
  return status === "APPROVED" || status === "IN_PROGRESS";
}

export function canStartReceivingSession(status: string): boolean {
  return status === "APPROVED";
}

export function canCompleteReceivingSession(status: string): boolean {
  return status === "IN_PROGRESS";
}

export function canApprovePutawaySession(status: string): boolean {
  return status === "PENDING_APPROVAL";
}

export function canAssignPutawaySession(status: string): boolean {
  return status === "APPROVED" || status === "IN_PROGRESS";
}

export function canApproveSchedulingCell(status: string): boolean {
  return status === "PLANNED";
}

export const INBOUND_REQUEST_STATUS_FILTERS: { value: InboundRequestStatus | "all"; labelKey: string }[] =
  [
    { value: "all", labelKey: "filterAllStatuses" },
    { value: "PENDING_ACCEPTANCE", labelKey: "statusPendingAcceptance" },
    { value: "RESERVATIONS_COMPLETE", labelKey: "statusReservationsComplete" },
    { value: "RECEIVING_IN_PROGRESS", labelKey: "statusReceivingInProgress" },
    { value: "PARTIALLY_RECEIVED", labelKey: "statusPartiallyReceived" },
    { value: "COMPLETED", labelKey: "statusCompleted" },
  ];

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const KNOWN_STATUS_KEYS = new Set(Object.keys(STATUS_VARIANT));

export function getStatusLabel(
  translate: (key: string) => string,
  status: string,
): string {
  if (KNOWN_STATUS_KEYS.has(status)) {
    return translate(status);
  }
  return status.replaceAll("_", " ");
}
