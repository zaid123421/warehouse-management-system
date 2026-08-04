const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "muted"> = {
  PLANNED: "default",
  PARTIAL_APPROVAL: "warning",
  SCHEDULED: "default",
  SCHEDULE_APPROVED: "success",
  TRUCK_ASSIGNED: "success",
  PICKING_SESSION_PENDING: "warning",
  PICKING_APPROVED: "success",
  PICKING_IN_PROGRESS: "default",
  PICKING_COMPLETED: "success",
  PARTIALLY_PICKED: "warning",
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  CANCELLED: "danger",
  SHIPPED: "success",
  PICKED: "success",
  OUTBOUND_PICKED: "success",
  SHIPPING_SESSION_PENDING: "warning",
  SHIPPING_APPROVED: "success",
  SHIPPING_IN_PROGRESS: "default",
  PARTIALLY_SHIPPED: "warning",
  SHIPPING: "default",
  MISSING: "danger",
};

export function getStatusVariant(status: string): "default" | "success" | "warning" | "danger" | "muted" {
  return STATUS_VARIANT[status] ?? "muted";
}

export function formatDayLabel(day: string): string {
  if (!day) return "—";
  return day.charAt(0) + day.slice(1).toLowerCase();
}

export function canApproveOutboundSchedulingCell(
  status: string,
  readyForApproval?: boolean,
): boolean {
  if (status !== "PLANNED" && status !== "PARTIAL_APPROVAL") return false;
  if (readyForApproval === false) return false;
  return true;
}

export function canApproveOutboundSchedulingDealer(dealer: {
  approved: boolean;
  readyForApproval: boolean;
}): boolean {
  return !dealer.approved && dealer.readyForApproval;
}

export function canOpenOutboundTruckPlanning(status: string): boolean {
  return status === "APPROVED" || status === "PARTIAL_APPROVAL";
}

export function isTodayServiceDate(serviceDate?: string | null): boolean {
  if (!serviceDate) return true;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return serviceDate === `${yyyy}-${mm}-${dd}`;
}

export function canApprovePickingSession(status: string): boolean {
  return status === "PENDING_APPROVAL";
}

export function canCancelPickingSession(status: string): boolean {
  return status === "PENDING_APPROVAL";
}

export function canAssignPickingSession(status: string): boolean {
  return status === "APPROVED" || status === "IN_PROGRESS";
}

export function canStartPickingSession(status: string): boolean {
  return status === "APPROVED";
}

export function canCompletePickingSession(status: string): boolean {
  return status === "IN_PROGRESS";
}

export function canDispatchPickingSession(status: string): boolean {
  return status === "COMPLETED";
}

export function canApproveShippingSession(status: string): boolean {
  return status === "PENDING_APPROVAL";
}

export function canCancelShippingSession(status: string): boolean {
  return status === "PENDING_APPROVAL";
}

export function canAssignShippingSession(status: string): boolean {
  return status === "APPROVED" || status === "IN_PROGRESS";
}

export function canStartShippingSession(status: string): boolean {
  return status === "APPROVED";
}

export function canCompleteShippingSession(status: string): boolean {
  return status === "IN_PROGRESS";
}

export function computeShippingSessionStats(sessions: { status: string; completedAt?: string }[]) {
  const today = new Date().toDateString();
  return {
    pendingApproval: sessions.filter((s) => s.status === "PENDING_APPROVAL").length,
    inProgress: sessions.filter((s) => s.status === "IN_PROGRESS").length,
    completedToday: sessions.filter((s) => {
      if (s.status !== "COMPLETED") return false;
      if (!s.completedAt) return false;
      return new Date(s.completedAt).toDateString() === today;
    }).length,
  };
}

export function formatDealerSummary(
  requests: { dealerName?: string }[],
  fallback: string,
): string {
  const names = Array.from(
    new Set(requests.map((r) => r.dealerName?.trim()).filter(Boolean)),
  ) as string[];
  if (names.length === 0) return fallback;
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
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
