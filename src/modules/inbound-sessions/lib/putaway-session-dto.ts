import { asRecord, pickNumber, pickString, str, unwrapPayload } from "@/shared/lib/dto-utils";
import type {
  PutawaySession,
  PutawaySessionLine,
} from "@/modules/inbound-sessions/types/putaway-session";
import { normalizeArray } from "@/modules/inbound-sessions/lib/scheduling-dto";

function normalizeStaffIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((id) => pickNumber({ v: id }, "v")).filter((id) => id > 0);
}

function normalizePutawayLine(raw: unknown): PutawaySessionLine | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  return {
    tireId: pickNumber(rec, "tireId") || undefined,
    tireUniqueId: pickString(rec, "tireUniqueId"),
    reservedLocationBarcode: pickString(rec, "reservedLocationBarcode"),
    lineStatus: pickString(rec, "lineStatus") || pickString(rec, "status"),
    status: pickString(rec, "status"),
    assignedStaffUserId: pickNumber(rec, "assignedStaffUserId") || undefined,
  };
}

export function normalizePutawaySession(raw: unknown): PutawaySession | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const id = pickNumber(rec, "id") || pickNumber(rec, "sessionId");
  if (!id) return null;
  const linesRaw = Array.isArray(rec.lines) ? rec.lines : [];
  const tireCount = pickNumber(rec, "tireCount");
  const completedCount = pickNumber(rec, "completedCount");
  const progressPercent =
    pickNumber(rec, "progressPercent") ||
    (tireCount > 0 ? Math.round((completedCount / tireCount) * 100) : 0);
  return {
    id,
    zoneId: pickNumber(rec, "zoneId") || undefined,
    zoneName: pickString(rec, "zoneName"),
    status: str(rec.status),
    tireCount,
    completedCount,
    progressPercent,
    assignedStaffUserIds: normalizeStaffIds(rec.assignedStaffUserIds),
    assignedStaffCount:
      pickNumber(rec, "assignedStaffCount") ||
      normalizeStaffIds(rec.assignedStaffUserIds).length ||
      undefined,
    exceptionScanCount: pickNumber(rec, "exceptionScanCount") || undefined,
    approvedAt: pickString(rec, "approvedAt"),
    createdAt: pickString(rec, "createdAt"),
    lines: linesRaw
      .map((item) => normalizePutawayLine(item))
      .filter((item): item is PutawaySessionLine => item != null),
  };
}

export function normalizePutawaySessionList(data: unknown): PutawaySession[] {
  return normalizeArray(data, normalizePutawaySession);
}

export function normalizePutawaySessionDetail(data: unknown): PutawaySession | null {
  const payload = unwrapPayload(data);
  return normalizePutawaySession(payload);
}
