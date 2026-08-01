export type PlanningPoolRequest = {
  inboundRequestId: number;
  status: string;
  dealerName?: string;
  totalVolume?: number;
  expectedTireCount?: number;
  receivingDay?: string;
  schedulingCellId?: number;
};

export type PlanningPoolParams = {
  schedulingCellId?: number;
};

export type InboundTruck = {
  id: number;
  label?: string;
  status: string;
  schedulingCellId?: number;
  receivingDay?: string;
  serviceDate?: string;
  capacityTires?: number;
  assignedTires?: number;
  requestCount?: number;
  handoverCompleteCount?: number;
  receivingSessionId?: number;
  ready?: boolean;
  version?: number;
  createdAt?: string;
  assignedRequests: InboundTruckRequestLink[];
};

export type InboundTruckRequestLink = {
  inboundRequestId: number;
  status: string;
  dealerName?: string;
};

export type CreateInboundTruckRequest = {
  schedulingCellId: number;
  receivingDay: string;
  serviceDate: string;
};

export type ApproveInboundTruckResult = {
  status: string;
  requests: InboundTruckRequestLink[];
};

export type TransitTruck = {
  truckId: number;
  label?: string;
  status: string;
  ready?: boolean;
  serviceDate?: string;
  receivingDay?: string;
  assignedTires?: number;
  expectedTires?: number;
  version?: number;
};

export type CreateReceivingFromTruckResult = {
  id: number;
  status: string;
  inboundTruckId?: number;
  inboundTruckLabel?: string;
  expectedTires: number;
  receivedTires: number;
};
