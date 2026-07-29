import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toInboundError } from "@/modules/inbound-sessions/lib/inbound-error";
import {
  normalizeReceivingSessionDetail,
  normalizeReceivingSessionList,
} from "@/modules/inbound-sessions/lib/receiving-session-dto";
import type {
  AssignReceivingSessionRequest,
  CreateReceivingSessionRequest,
  ReceivingSession,
} from "@/modules/inbound-sessions/types/receiving-session";

export async function getReceivingSessions(): Promise<ReceivingSession[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_RECEIVING_SESSIONS.LIST);
    return normalizeReceivingSessionList(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function getReceivingSessionById(sessionId: number): Promise<ReceivingSession> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_RECEIVING_SESSIONS.BY_ID(sessionId));
    const detail = normalizeReceivingSessionDetail(data);
    if (!detail) throw new Error("Invalid receiving session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function createReceivingSession(
  payload: CreateReceivingSessionRequest,
): Promise<ReceivingSession> {
  try {
    const { data } = await api.post<unknown>(ENDPOINTS.WMS_RECEIVING_SESSIONS.CREATE, payload);
    const detail = normalizeReceivingSessionDetail(data);
    if (!detail) throw new Error("Invalid create receiving session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function approveReceivingSession(sessionId: number): Promise<ReceivingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_RECEIVING_SESSIONS.APPROVE(sessionId),
    );
    const detail = normalizeReceivingSessionDetail(data);
    if (!detail) throw new Error("Invalid approve receiving session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function rejectReceivingSession(sessionId: number): Promise<ReceivingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_RECEIVING_SESSIONS.REJECT(sessionId),
    );
    const detail = normalizeReceivingSessionDetail(data);
    if (!detail) throw new Error("Invalid reject receiving session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function assignReceivingSession(
  sessionId: number,
  payload: AssignReceivingSessionRequest,
): Promise<ReceivingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_RECEIVING_SESSIONS.ASSIGN(sessionId),
      payload,
    );
    const detail = normalizeReceivingSessionDetail(data);
    if (!detail) throw new Error("Invalid assign receiving session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function startReceivingSession(sessionId: number): Promise<ReceivingSession> {
  try {
    const { data } = await api.post<unknown>(ENDPOINTS.WMS_RECEIVING_SESSIONS.START(sessionId));
    const detail = normalizeReceivingSessionDetail(data);
    if (!detail) throw new Error("Invalid start receiving session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function completeReceivingSession(sessionId: number): Promise<ReceivingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_RECEIVING_SESSIONS.COMPLETE(sessionId),
    );
    const detail = normalizeReceivingSessionDetail(data);
    if (!detail) throw new Error("Invalid complete receiving session response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}
