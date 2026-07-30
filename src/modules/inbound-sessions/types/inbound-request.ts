export type InboundRequestStatus =
  | "SCHEDULED"
  | "SCHEDULE_APPROVED"
  | "TRUCK_ASSIGNED"
  | "PENDING_SCHEDULING"
  | "RESERVATIONS_COMPLETE"
  | "RECEIVING_SESSION_PENDING"
  | "RECEIVING_APPROVED"
  | "RECEIVING_IN_PROGRESS"
  | "RECEIVING_COMPLETED"
  | "PARTIALLY_RECEIVED"
  | "PUTAWAY_APPROVED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED_RESERVATION"
  | string;

export type InboundRequestListParams = {
  status: InboundRequestStatus | string;
};

export type InboundRequestLine = {
  tireId?: number;
  tireUniqueId?: string;
  reservedPositionId?: number;
  reservedPositionBarcode?: string;
  status: string;
  lineStatus?: string;
  assignedStaffUserId?: number;
};

export type InboundRequest = {
  id: number;
  status: InboundRequestStatus;
  scheduleStatus?: string;
  receivingDay?: string;
  expectedTireCount: number;
  receivedTireCount?: number;
  storedTireCount?: number;
  dealerName?: string;
  dealerId?: number;
  shipmentRequestId?: number;
  acceptedAt?: string;
  completedAt?: string;
  createdAt?: string;
  lines: InboundRequestLine[];
};
