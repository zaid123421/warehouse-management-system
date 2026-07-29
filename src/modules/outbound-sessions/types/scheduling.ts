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
  regionProvinceId?: number;
  regionProvinceName: string;
  totalVolume: number;
  estimatedTrucks: number;
  status: OutboundSchedulingCellStatus;
  requestCount: number;
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
};

export type OutboundSchedulingCellDetail = {
  cellId: number;
  deliveryDay: DayOfWeek | string;
  regionProvinceName?: string;
  totalVolume?: number;
  estimatedTrucks?: number;
  status: OutboundSchedulingCellStatus;
  requests: OutboundSchedulingCellRequest[];
};

export type ApproveOutboundSchedulingCellResult = {
  status: string;
  requests: OutboundSchedulingCellRequest[];
};

export type GeneratePickingSessionsRequest = {
  deliveryDay?: DayOfWeek | string;
};

export type GeneratedPickingSession = {
  pickingSessionId: number;
  deliveryDay?: string;
  outboundRequestCount?: number;
  expectedTires?: number;
  status: string;
};

export type GeneratePickingSessionsResult = {
  sessions: GeneratedPickingSession[];
};
