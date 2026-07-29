import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toInboundError } from "@/modules/inbound-sessions/lib/inbound-error";
import {
  normalizeInboundRequestDetail,
  normalizeInboundRequestList,
} from "@/modules/inbound-sessions/lib/inbound-request-dto";
import type {
  InboundRequest,
  InboundRequestListParams,
} from "@/modules/inbound-sessions/types/inbound-request";

export async function getInboundRequests(
  params?: InboundRequestListParams,
): Promise<InboundRequest[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_INBOUND_REQUESTS.LIST, {
      params: params?.status ? { status: params.status } : undefined,
    });
    return normalizeInboundRequestList(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function getInboundRequestById(requestId: number): Promise<InboundRequest> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_INBOUND_REQUESTS.BY_ID(requestId));
    const detail = normalizeInboundRequestDetail(data);
    if (!detail) throw new Error("Invalid inbound request response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function acceptInboundRequest(requestId: number): Promise<InboundRequest> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_INBOUND_REQUESTS.ACCEPT(requestId),
    );
    const detail = normalizeInboundRequestDetail(data);
    if (!detail) throw new Error("Invalid accept response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function rejectInboundRequest(requestId: number): Promise<InboundRequest> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_INBOUND_REQUESTS.REJECT(requestId),
    );
    const detail = normalizeInboundRequestDetail(data);
    if (!detail) throw new Error("Invalid reject response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}
