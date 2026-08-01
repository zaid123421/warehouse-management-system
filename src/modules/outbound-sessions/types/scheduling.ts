export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type OutboundSchedulingCellStatus = "PLANNED" | "APPROVED" | string;

export type OutboundSchedulingCell = {
  cellId: number;
  deliveryDay: DayOfWeek | string;
  serviceDate?: string;
  regionCityId?: number;
  regionCityName: string;
  /** @deprecated Prefer regionCityName — kept for older payloads */
  regionProvinceId?: number;
  regionProvinceName?: string;
  totalVolume: number;
  estimatedTrucks: number;
  status: OutboundSchedulingCellStatus;
  requestCount: number;
  cutoffAt?: string;
  readyForApproval?: boolean;
};

export type OutboundSchedulingBoard = {
  warehouseId: number;
  cells: OutboundSchedulingCell[];
};

export type OutboundSchedulingCellRequest = {
  outboundRequestId: number;
  status: string;
  scheduleStatus?: string;
  dealerName?: string;
  totalVolume?: number;
  deliveryDay?: string;
  serviceDate?: string;
};

export type OutboundSchedulingCellDetail = {
  cellId: number;
  deliveryDay: DayOfWeek | string;
  serviceDate?: string;
  regionCityId?: number;
  regionCityName?: string;
  regionProvinceName?: string;
  totalVolume?: number;
  estimatedTrucks?: number;
  status: OutboundSchedulingCellStatus;
  cutoffAt?: string;
  readyForApproval?: boolean;
  requests: OutboundSchedulingCellRequest[];
};

export type ApproveOutboundSchedulingCellResult = {
  status: string;
  requests: OutboundSchedulingCellRequest[];
};

export type GeneratePickingSessionsRequest = {
  serviceDate?: string;
  /** @deprecated Backend expects serviceDate */
  deliveryDay?: DayOfWeek | string;
};

export type GeneratedPickingSession = {
  pickingSessionId: number;
  deliveryDay?: string;
  serviceDate?: string;
  outboundRequestCount?: number;
  expectedTires?: number;
  status: string;
};

export type GeneratePickingSessionsResult = {
  sessions: GeneratedPickingSession[];
};
