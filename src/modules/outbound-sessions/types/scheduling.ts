export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type OutboundSchedulingCellStatus =
  | "PLANNED"
  | "PARTIAL_APPROVAL"
  | "APPROVED"
  | string;

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
  version?: number;
};

export type OutboundSchedulingBoard = {
  warehouseId: number;
  /** Monday of the returned calendar week, `YYYY-MM-DD`. */
  weekStart?: string;
  /** Sunday of that week, inclusive. */
  weekEnd?: string;
  cells: OutboundSchedulingCell[];
};

export type OutboundSchedulingCellRequest = {
  outboundRequestId: number;
  status: string;
  scheduleStatus?: string;
  dealerId?: number;
  dealerName?: string;
  totalVolume?: number;
  deliveryDay?: string;
  serviceDate?: string;
};

export type OutboundSchedulingCellDealer = {
  dealerId: number;
  dealerName: string;
  requestCount: number;
  totalVolume: number;
  approved: boolean;
  readyForApproval: boolean;
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
  approvedDealerCount?: number;
  totalDealerCount?: number;
  cutoffAt?: string;
  readyForApproval?: boolean;
  version: number;
  dealers: OutboundSchedulingCellDealer[];
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
