import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toOutboundError } from "@/modules/outbound-sessions/lib/outbound-error";
import {
  normalizeApproveOutboundSchedulingCellResult,
  normalizeGeneratePickingSessionsResult,
  normalizeOutboundSchedulingBoard,
  normalizeOutboundSchedulingCellDetail,
} from "@/modules/outbound-sessions/lib/scheduling-dto";
import type {
  ApproveOutboundSchedulingCellResult,
  GeneratePickingSessionsRequest,
  GeneratePickingSessionsResult,
  OutboundSchedulingBoard,
  OutboundSchedulingCellDetail,
} from "@/modules/outbound-sessions/types/scheduling";

export async function getOutboundSchedulingBoard(): Promise<OutboundSchedulingBoard> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_OUTBOUND_SCHEDULING.BOARD);
    return normalizeOutboundSchedulingBoard(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function getOutboundSchedulingCellDetail(
  cellId: number,
): Promise<OutboundSchedulingCellDetail> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_OUTBOUND_SCHEDULING.CELL(cellId));
    const detail = normalizeOutboundSchedulingCellDetail(data);
    if (!detail) throw new Error("Invalid outbound scheduling cell response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function approveOutboundSchedulingCell(
  cellId: number,
): Promise<ApproveOutboundSchedulingCellResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_OUTBOUND_SCHEDULING.APPROVE_CELL(cellId),
    );
    return normalizeApproveOutboundSchedulingCellResult(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function generatePickingSessions(
  payload?: GeneratePickingSessionsRequest,
): Promise<GeneratePickingSessionsResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_OUTBOUND_SCHEDULING.GENERATE_PICKING,
      payload ?? {},
    );
    return normalizeGeneratePickingSessionsResult(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}
