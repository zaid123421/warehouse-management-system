export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type SchedulingCellStatus =
  | "PLANNED"
  | "PARTIAL_APPROVAL"
  | "APPROVED"
  | string;

export type SchedulingCell = {
  cellId: number;
  receivingDay: DayOfWeek | string;
  serviceDate?: string;
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
  /** Monday of the returned calendar week, `YYYY-MM-DD`. */
  weekStart?: string;
  /** Sunday of that week, inclusive. */
  weekEnd?: string;
  cells: SchedulingCell[];
};

export type SchedulingCellRequest = {
  inboundRequestId: number;
  shipmentRequestId?: number;
  dealerId?: number;
  dealerName?: string;
  serviceDate?: string;
  receivingDay?: string;
  regionCityId?: number;
  regionCityName?: string;
  totalVolume?: number;
  status: string;
  scheduleStatus?: string;
};

export type SchedulingCellDealer = {
  dealerId: number;
  dealerName: string;
  requestCount: number;
  totalVolume: number;
  approved: boolean;
  readyForApproval: boolean;
};

export type SchedulingCellDetail = {
  cellId: number;
  serviceDate?: string;
  receivingDay: DayOfWeek | string;
  regionCityId?: number;
  regionCityName?: string;
  /** @deprecated Prefer regionCityName; kept for board/grid helpers. */
  regionProvinceName?: string;
  totalVolume: number;
  estimatedTrucks: number;
  status: SchedulingCellStatus;
  approvedDealerCount: number;
  totalDealerCount: number;
  cutoffAt?: string;
  readyForApproval: boolean;
  version: number;
  dealers: SchedulingCellDealer[];
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
