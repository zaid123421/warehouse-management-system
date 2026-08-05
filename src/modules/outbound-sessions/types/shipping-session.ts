export type ShippingSessionStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export type ShippingSessionOutboundLink = {
  outboundRequestId: number;
  status: string;
  dealerName?: string;
  totalVolume?: number;
};

export type ShippingSessionLine = {
  outboundRequestLineId?: number;
  tireId?: number;
  tireUniqueId?: string;
  customerName?: string;
  vehicleLabel?: string;
  dealerName?: string;
  lineStatus?: string;
  status?: string;
  scannedAt?: string;
};

export type ShippingSession = {
  id: number;
  status: ShippingSessionStatus;
  deliveryDay?: string;
  serviceDate?: string;
  outboundTruckId?: number;
  outboundTruckLabel?: string;
  expectedTires: number;
  shippedTires: number;
  missingTires: number;
  progressPercent?: number;
  outboundRequestCount?: number;
  assignedStaffUserIds?: number[];
  assignedStaffCount?: number;
  startedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  createdAt?: string;
  version?: number;
  outboundRequests: ShippingSessionOutboundLink[];
  lines: ShippingSessionLine[];
};

export type AssignShippingSessionRequest = {
  staffUserIds: number[];
  version: number;
};

export type GenerateShippingSessionsRequest = {
  deliveryDay?: string;
};

export type GeneratedShippingSession = {
  shippingSessionId: number;
  deliveryDay?: string;
  outboundRequestCount?: number;
  expectedTires?: number;
  status: string;
};

export type GenerateShippingSessionsResult = {
  sessions: GeneratedShippingSession[];
};
