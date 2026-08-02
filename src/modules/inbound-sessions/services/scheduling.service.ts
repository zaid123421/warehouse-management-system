import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toInboundError } from "@/modules/inbound-sessions/lib/inbound-error";
import { toVersionBody } from "@/modules/inbound-sessions/lib/optimistic-lock";
import {
  normalizeSchedulingBoard,
  normalizeSchedulingCellDetail,
} from "@/modules/inbound-sessions/lib/scheduling-dto";
import type {
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

export async function approveSchedulingCellDealer(
  cellId: number,
  dealerId: number,
  version?: number | null,
): Promise<SchedulingCellDetail | null> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_INBOUND_SCHEDULING.APPROVE_DEALER(cellId, dealerId),
      toVersionBody(version),
    );
    return normalizeSchedulingCellDetail(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}
