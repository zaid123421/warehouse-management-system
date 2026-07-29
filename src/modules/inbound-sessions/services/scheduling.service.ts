import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toInboundError } from "@/modules/inbound-sessions/lib/inbound-error";
import {
  normalizeApproveSchedulingCellResult,
  normalizeGenerateReceivingSessionsResult,
  normalizeSchedulingBoard,
  normalizeSchedulingCellDetail,
} from "@/modules/inbound-sessions/lib/scheduling-dto";
import type {
  ApproveSchedulingCellResult,
  GenerateReceivingSessionsRequest,
  GenerateReceivingSessionsResult,
  SchedulingBoard,
  SchedulingCellDetail,
} from "@/modules/inbound-sessions/types/scheduling";

export async function getSchedulingBoard(): Promise<SchedulingBoard> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_INBOUND_SCHEDULING.BOARD);
    return normalizeSchedulingBoard(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function getSchedulingCellDetail(cellId: number): Promise<SchedulingCellDetail> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_INBOUND_SCHEDULING.CELL(cellId));
    const detail = normalizeSchedulingCellDetail(data);
    if (!detail) throw new Error("Invalid scheduling cell response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function approveSchedulingCell(
  cellId: number,
): Promise<ApproveSchedulingCellResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_INBOUND_SCHEDULING.APPROVE_CELL(cellId),
    );
    return normalizeApproveSchedulingCellResult(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function generateReceivingSessions(
  payload: GenerateReceivingSessionsRequest,
): Promise<GenerateReceivingSessionsResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_INBOUND_SCHEDULING.GENERATE_RECEIVING,
      payload,
    );
    return normalizeGenerateReceivingSessionsResult(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}
