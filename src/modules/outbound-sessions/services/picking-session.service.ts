import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toOutboundError } from "@/modules/outbound-sessions/lib/outbound-error";
import { toVersionBody } from "@/modules/outbound-sessions/lib/optimistic-lock";
import {
  normalizePickingSessionDetail,
  normalizePickingSessionList,
} from "@/modules/outbound-sessions/lib/picking-session-dto";
import type {
  AssignPickingSessionRequest,
  PickingSession,
} from "@/modules/outbound-sessions/types/picking-session";

export async function getPickingSessions(): Promise<PickingSession[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_PICKING_SESSIONS.LIST);
    return normalizePickingSessionList(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function getPickingSessionById(sessionId: number): Promise<PickingSession> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_PICKING_SESSIONS.BY_ID(sessionId));
    const detail = normalizePickingSessionDetail(data);
    if (!detail) throw new Error("Invalid picking session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function approvePickingSession(
  sessionId: number,
  version?: number | null,
): Promise<PickingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_PICKING_SESSIONS.APPROVE(sessionId),
      toVersionBody(version),
    );
    const detail = normalizePickingSessionDetail(data);
    if (!detail) throw new Error("Invalid approve picking session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function cancelPickingSession(
  sessionId: number,
  version?: number | null,
): Promise<PickingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_PICKING_SESSIONS.CANCEL(sessionId),
      toVersionBody(version),
    );
    const detail = normalizePickingSessionDetail(data);
    if (!detail) throw new Error("Invalid cancel picking session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function assignPickingSession(
  sessionId: number,
  payload: AssignPickingSessionRequest,
): Promise<PickingSession> {
  try {
    const { data } = await api.post<unknown>(ENDPOINTS.WMS_PICKING_SESSIONS.ASSIGN(sessionId), {
      version: payload.version ?? 0,
      staffUserIds: payload.staffUserIds,
    });
    const detail = normalizePickingSessionDetail(data);
    if (!detail) throw new Error("Invalid assign picking session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function startPickingSession(
  sessionId: number,
  version?: number | null,
): Promise<PickingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_PICKING_SESSIONS.START(sessionId),
      toVersionBody(version),
    );
    const detail = normalizePickingSessionDetail(data);
    if (!detail) throw new Error("Invalid start picking session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function completePickingSession(
  sessionId: number,
  version?: number | null,
): Promise<PickingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_PICKING_SESSIONS.COMPLETE(sessionId),
      toVersionBody(version),
    );
    const detail = normalizePickingSessionDetail(data);
    if (!detail) throw new Error("Invalid complete picking session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function dispatchPickingSession(
  sessionId: number,
  version?: number | null,
): Promise<PickingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_PICKING_SESSIONS.DISPATCH(sessionId),
      toVersionBody(version),
    );
    const detail = normalizePickingSessionDetail(data);
    if (!detail) throw new Error("Invalid dispatch picking session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}
