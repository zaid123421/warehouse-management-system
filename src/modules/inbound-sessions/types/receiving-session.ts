export type ReceivingSessionStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export type ReceivingSessionInboundLink = {
  inboundRequestId: number;
  status: string;
  dealerName?: string;
};

export type ReceivingSession = {
  id: number;
  status: ReceivingSessionStatus;
  expectedTires: number;
  receivedTires: number;
  progressPercent?: number;
  inboundTruckId?: number;
  inboundTruckLabel?: string;
  assignedStaffUserIds?: number[];
  assignedStaffCount?: number;
  exceptionScanCount?: number;
  version?: number;
  startedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  createdAt?: string;
  inboundRequests: ReceivingSessionInboundLink[];
};

export type AssignReceivingSessionRequest = {
  staffUserIds: number[];
  version: number;
};

export type ReceivingSessionActionResult = ReceivingSession;
