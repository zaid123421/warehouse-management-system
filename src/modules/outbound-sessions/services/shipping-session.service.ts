import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toOutboundError } from "@/modules/outbound-sessions/lib/outbound-error";
import { toVersionBody } from "@/modules/outbound-sessions/lib/optimistic-lock";
import {
  normalizeGenerateShippingSessionsResult,
  normalizeShippingSessionDetail,
  normalizeShippingSessionList,
} from "@/modules/outbound-sessions/lib/shipping-session-dto";
import type {
  AssignShippingSessionRequest,
  GenerateShippingSessionsRequest,
  GenerateShippingSessionsResult,
  ShippingSession,
} from "@/modules/outbound-sessions/types/shipping-session";

export async function getShippingSessions(): Promise<ShippingSession[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_SHIPPING_SESSIONS.LIST);
    return normalizeShippingSessionList(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function getShippingSessionById(sessionId: number): Promise<ShippingSession> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_SHIPPING_SESSIONS.BY_ID(sessionId));
    const detail = normalizeShippingSessionDetail(data);
    if (!detail) throw new Error("Invalid shipping session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function generateShippingSessions(
  payload?: GenerateShippingSessionsRequest,
): Promise<GenerateShippingSessionsResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_SHIPPING_SESSIONS.GENERATE,
      payload ?? {},
    );
    return normalizeGenerateShippingSessionsResult(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function approveShippingSession(
  sessionId: number,
  version?: number | null,
): Promise<ShippingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_SHIPPING_SESSIONS.APPROVE(sessionId),
      toVersionBody(version),
    );
    const detail = normalizeShippingSessionDetail(data);
    if (!detail) throw new Error("Invalid approve shipping session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function cancelShippingSession(
  sessionId: number,
  version?: number | null,
): Promise<ShippingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_SHIPPING_SESSIONS.CANCEL(sessionId),
      toVersionBody(version),
    );
    const detail = normalizeShippingSessionDetail(data);
    if (!detail) throw new Error("Invalid cancel shipping session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function assignShippingSession(
  sessionId: number,
  payload: AssignShippingSessionRequest,
): Promise<ShippingSession> {
  try {
    const { data } = await api.post<unknown>(ENDPOINTS.WMS_SHIPPING_SESSIONS.ASSIGN(sessionId), {
      version: payload.version ?? 0,
      staffUserIds: payload.staffUserIds,
    });
    const detail = normalizeShippingSessionDetail(data);
    if (!detail) throw new Error("Invalid assign shipping session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function startShippingSession(
  sessionId: number,
  version?: number | null,
): Promise<ShippingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_SHIPPING_SESSIONS.START(sessionId),
      toVersionBody(version),
    );
    const detail = normalizeShippingSessionDetail(data);
    if (!detail) throw new Error("Invalid start shipping session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function completeShippingSession(
  sessionId: number,
  version?: number | null,
): Promise<ShippingSession> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_SHIPPING_SESSIONS.COMPLETE(sessionId),
      toVersionBody(version),
    );
    const detail = normalizeShippingSessionDetail(data);
    if (!detail) throw new Error("Invalid complete shipping session response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}
