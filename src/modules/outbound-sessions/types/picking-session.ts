export type PickingSessionStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export type PickingSessionOutboundLink = {
  outboundRequestId: number;
  status: string;
  dealerName?: string;
  totalVolume?: number;
};

export type PickingSessionLine = {
  tireId?: number;
  tireUniqueId?: string;
  lineStatus?: string;
  status?: string;
  locationBarcode?: string;
  assignedStaffUserId?: number;
};

export type PickingSession = {
  id: number;
  status: PickingSessionStatus;
  deliveryDay?: string;
  serviceDate?: string;
  expectedTires: number;
  pickedTires?: number;
  completedCount?: number;
  progressPercent?: number;
  outboundRequestCount?: number;
  assignedStaffUserIds?: number[];
  assignedStaffCount?: number;
  exceptionScanCount?: number;
  startedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  dispatchedAt?: string;
  createdAt?: string;
  outboundRequests: PickingSessionOutboundLink[];
  lines: PickingSessionLine[];
};

export type AssignPickingSessionRequest = {
  staffUserIds: number[];
};
