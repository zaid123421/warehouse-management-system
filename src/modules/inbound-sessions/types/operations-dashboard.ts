import type { InboundRequest } from "./inbound-request";
import type { PutawaySession } from "./putaway-session";
import type { ReceivingSession } from "./receiving-session";

export type OperationsCounters = {
  activeInboundRequestCount: number;
  totalExpectedTires: number;
  totalReceivedTires: number;
  totalStoredTires: number;
  reservedLineCount: number;
  expiredReservationCount: number;
  receivingExceptionScanCount: number;
  putawayExceptionScanCount: number;
};

export type OperationsAlert = {
  type?: string;
  message?: string;
  severity?: string;
};

export type OperationsDashboardReceivingSession = Pick<
  ReceivingSession,
  | "id"
  | "status"
  | "expectedTires"
  | "receivedTires"
  | "progressPercent"
  | "assignedStaffCount"
  | "exceptionScanCount"
> & { sessionId: number };

export type OperationsDashboardPutawaySession = Pick<
  PutawaySession,
  | "zoneId"
  | "zoneName"
  | "status"
  | "tireCount"
  | "completedCount"
  | "progressPercent"
  | "assignedStaffCount"
  | "exceptionScanCount"
> & { sessionId: number };

export type OperationsDashboard = {
  warehouseId: number;
  counters: OperationsCounters;
  alerts: OperationsAlert[];
  receivingSessions: OperationsDashboardReceivingSession[];
  putawaySessions: OperationsDashboardPutawaySession[];
  attentionInboundRequests: InboundRequest[];
};
