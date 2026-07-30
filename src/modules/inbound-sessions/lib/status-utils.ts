const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  PLANNED: "default",
  SCHEDULED: "default",
  SCHEDULE_APPROVED: "success",
  TRUCK_ASSIGNED: "default",
  IN_TRANSIT: "default",
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
  PUTAWAY_IN_PROGRESS: "default",
  APPROVED: "success",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELLED: "danger",
  EXPIRED_RESERVATION: "danger",
  RESERVED: "default",
  STORED: "success",
  MISSING: "danger",
  PUTAWAY_PENDING: "warning",
  AT_STAGING: "default",
};

export function getStatusVariant(status: string): "default" | "success" | "warning" | "danger" | "muted" {
  return STATUS_VARIANT[status] ?? "muted";
}

export function formatDayLabel(day: string): string {
  if (!day) return "—";
  return day.charAt(0) + day.slice(1).toLowerCase();
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

export function canStartPutawaySession(status: string): boolean {
  return status === "APPROVED";
}

export function canApproveSchedulingCell(status: string): boolean {
  return status === "PLANNED";
}

export function canAssignToInboundTruck(status: string): boolean {
  return status === "PLANNED";
}

export function canApproveInboundTruck(status: string): boolean {
  return status === "PLANNED";
}

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
