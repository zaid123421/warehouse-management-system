import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toInboundError } from "@/modules/inbound-sessions/lib/inbound-error";
import {
  normalizePutawaySessionDetail,
  normalizePutawaySessionList,
} from "@/modules/inbound-sessions/lib/putaway-session-dto";
import type {
  AssignPutawaySessionRequest,
  PutawaySession,
} from "@/modules/inbound-sessions/types/putaway-session";

export async function getPutawaySessions(): Promise<PutawaySession[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_PUTAWAY_SESSIONS.LIST);
    return normalizePutawaySessionList(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function getPutawaySessionById(sessionId: number): Promise<PutawaySession> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_PUTAWAY_SESSIONS.BY_ID(sessionId));
    const detail = normalizePutawaySessionDetail(data);
    if (!detail) throw new Error("Invalid putaway session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function approvePutawaySession(sessionId: number): Promise<PutawaySession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_PUTAWAY_SESSIONS.APPROVE(sessionId),
    );
    const detail = normalizePutawaySessionDetail(data);
    if (!detail) throw new Error("Invalid approve putaway session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function assignPutawaySession(
  sessionId: number,
  payload: AssignPutawaySessionRequest,
): Promise<PutawaySession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_PUTAWAY_SESSIONS.ASSIGN(sessionId),
      payload,
    );
    const detail = normalizePutawaySessionDetail(data);
    if (!detail) throw new Error("Invalid assign putaway session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}
