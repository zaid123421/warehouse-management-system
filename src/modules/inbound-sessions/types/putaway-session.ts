export type PutawaySessionStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export type PutawaySessionLine = {
  tireId?: number;
  tireUniqueId?: string;
  reservedLocationBarcode?: string;
  lineStatus?: string;
  status?: string;
  assignedStaffUserId?: number;
};

export type PutawaySession = {
  id: number;
  zoneId?: number;
  zoneName?: string;
  status: PutawaySessionStatus;
  tireCount: number;
  completedCount: number;
  progressPercent?: number;
  assignedStaffUserIds?: number[];
  assignedStaffCount?: number;
  exceptionScanCount?: number;
  approvedAt?: string;
  createdAt?: string;
  lines: PutawaySessionLine[];
};

export type AssignPutawaySessionRequest = {
  staffUserIds: number[];
};

export type PutawaySessionActionResult = PutawaySession;
