export type OccupancyUsage = {
  empty: number;
  occupied: number;
  reservedInbound: number;
  reservedOutbound: number;
  total: number;
};

export type OverviewZone = {
  zoneId: number;
  zoneName: string;
  occupancyPercent: number;
  usage: OccupancyUsage;
};

export type OverviewAttentionItem = {
  type: string;
  entityId: number | null;
  title: string;
  subtitle: string;
  occurredAt: string | null;
};

export type OverviewTopPerformer = {
  userId: number;
  displayName: string;
  matchScans: number;
};

export type OverviewLive = {
  activeInboundRequestCount: number;
  totalExpectedTires: number;
  totalReceivedTires: number;
  totalStoredTires: number;
  reservedLineCount: number;
  expiredReservationCount: number;
  receivingSessionsInProgress: number;
  putawaySessionsInProgress: number;
  pickingSessionsInProgress: number;
  openShippingSessionCount: number;
  receivingExceptionScanCount: number;
  putawayExceptionScanCount: number;
  pickingMissingLineCount: number;
  pickingExceptionScanCount: number;
  shippingMissingLineCount: number;
  shippingExceptionScanCount: number;
};

export type OverviewCapacity = {
  designedCapacity: number;
  occupancyPercent: number;
  warehouse: OccupancyUsage;
  topZones: OverviewZone[];
};

export type OverviewStaff = {
  staffTotal: number;
  staffActive: number;
};

export type OverviewActivity = {
  slaInboundOnTimePercent: number;
  slaOutboundOnTimePercent: number;
  slaOpenOverdue: number;
  pendingInbound: number;
  pendingOutbound: number;
  topPerformers: OverviewTopPerformer[];
};

export type OverviewSessionProgress = {
  sessionId: number;
  status: string;
  progressPercent: number;
  label: string;
  detail: string;
  exceptionScanCount: number;
};

export type WarehouseOverview = {
  warehouseId: number;
  warehouseName: string;
  generatedAt: string | null;
  activityWindow: {
    from: string | null;
    to: string | null;
    days: number;
  };
  live: OverviewLive;
  capacity: OverviewCapacity;
  staff: OverviewStaff;
  activity: OverviewActivity;
  attention: OverviewAttentionItem[];
  operationsAlerts: string[];
  receivingSessions: OverviewSessionProgress[];
  putawaySessions: OverviewSessionProgress[];
  pickingSessions: OverviewSessionProgress[];
  shippingSessions: OverviewSessionProgress[];
};
