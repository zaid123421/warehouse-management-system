export type OutboundPlanningPoolRequest = {
  outboundRequestId: number;
  status: string;
  scheduleStatus?: string;
  dealerName?: string;
  totalVolume?: number;
  expectedTireCount?: number;
  deliveryDay?: string;
  serviceDate?: string;
  regionCityId?: number;
  regionCityName?: string;
  schedulingCellId?: number;
};

export type OutboundPlanningPoolParams = {
  schedulingCellId?: number;
};

export type OutboundTruckRequestLink = {
  outboundRequestId: number;
  status: string;
  dealerName?: string;
  expectedTireCount?: number;
};

export type OutboundTruck = {
  id: number;
  label?: string;
  status: string;
  schedulingCellId?: number;
  deliveryDay?: string;
  serviceDate?: string;
  capacityTires?: number;
  assignedTires?: number;
  requestCount?: number;
  shippingSessionId?: number;
  ready?: boolean;
  createdAt?: string;
  approvedAt?: string;
  assignedRequests: OutboundTruckRequestLink[];
};

export type CreateOutboundTruckRequest = {
  schedulingCellId?: number;
  deliveryDay?: string;
  serviceDate?: string;
};

export type ConfirmOutboundTruckPlanRequest = {
  schedulingCellId?: number;
  trucks: Array<{ requestIds: number[] }>;
};

export type ConfirmOutboundTruckPlanResult = {
  trucks: OutboundTruck[];
  pickingSessionCount: number;
};

export type ApproveOutboundTruckResult = {
  status: string;
  requests: OutboundTruckRequestLink[];
};

export type ReadyToShipTruck = {
  truckId: number;
  label?: string;
  status: string;
  ready?: boolean;
  serviceDate?: string;
  deliveryDay?: string;
  assignedTires?: number;
  capacityTires?: number;
  requestCount?: number;
  shippingSessionId?: number;
};

export type CreateShippingFromTruckResult = {
  id: number;
  status: string;
  outboundTruckId?: number;
  outboundTruckLabel?: string;
  serviceDate?: string;
  expectedTires: number;
  shippedTires: number;
};
