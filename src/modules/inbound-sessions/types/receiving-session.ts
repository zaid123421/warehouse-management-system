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
  assignedStaffUserIds?: number[];
  assignedStaffCount?: number;
  exceptionScanCount?: number;
  startedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  createdAt?: string;
  inboundRequests: ReceivingSessionInboundLink[];
};

export type CreateReceivingSessionRequest = {
  inboundRequestIds: number[];
};

export type AssignReceivingSessionRequest = {
  staffUserIds: number[];
};

export type ReceivingSessionActionResult = ReceivingSession;
