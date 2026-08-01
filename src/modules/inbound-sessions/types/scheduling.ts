export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type SchedulingCellStatus = "PLANNED" | "APPROVED" | string;

export type SchedulingCell = {
  cellId: number;
  receivingDay: DayOfWeek | string;
  regionProvinceId?: number;
  regionProvinceName: string;
  totalVolume: number;
  estimatedTrucks: number;
  status: SchedulingCellStatus;
  requestCount: number;
  version?: number;
};

export type SchedulingBoard = {
  warehouseId: number;
  cells: SchedulingCell[];
};

export type SchedulingCellRequest = {
  inboundRequestId: number;
  status: string;
  scheduleStatus?: string;
  dealerName?: string;
  totalVolume?: number;
  receivingDay?: string;
};

export type SchedulingCellDetail = {
  cellId: number;
  receivingDay: DayOfWeek | string;
  serviceDate?: string;
  regionProvinceName?: string;
  totalVolume?: number;
  estimatedTrucks?: number;
  status: SchedulingCellStatus;
  version?: number;
  requests: SchedulingCellRequest[];
};

export type ApproveSchedulingCellResult = {
  status: string;
  requests: SchedulingCellRequest[];
};

export type GenerateReceivingSessionsRequest = {
  receivingDay: DayOfWeek | string;
};

export type GeneratedReceivingSession = {
  receivingSessionId: number;
  receivingDay?: string;
  inboundRequestCount?: number;
  expectedTires?: number;
  status: string;
};

export type GenerateReceivingSessionsResult = {
  sessions: GeneratedReceivingSession[];
};
