import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toInboundError } from "@/modules/inbound-sessions/lib/inbound-error";
import {
  normalizeApproveInboundTruckResult,
  normalizeCreateReceivingFromTruckResult,
  normalizeInboundTruckDetail,
  normalizeInboundTruckList,
  normalizePlanningPoolList,
  normalizeTransitTruckList,
} from "@/modules/inbound-sessions/lib/inbound-truck-dto";
import type {
  ApproveInboundTruckResult,
  CreateInboundTruckRequest,
  CreateReceivingFromTruckResult,
  InboundTruck,
  PlanningPoolParams,
  PlanningPoolRequest,
  TransitTruck,
} from "@/modules/inbound-sessions/types/inbound-truck";

export async function getPlanningPool(
  params?: PlanningPoolParams,
): Promise<PlanningPoolRequest[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_INBOUND_TRUCKS.PLANNING_POOL, {
      params: params?.schedulingCellId
        ? { schedulingCellId: params.schedulingCellId }
        : undefined,
    });
    return normalizePlanningPoolList(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function getPlanningTrucks(params?: {
  serviceDate?: string;
  receivingDay?: string;
}): Promise<InboundTruck[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_INBOUND_TRUCKS.PLANNING);
    let trucks = normalizeInboundTruckList(data);
    if (params?.serviceDate || params?.receivingDay) {
      trucks = trucks.filter(
        (truck) =>
          (!params.serviceDate || truck.serviceDate === params.serviceDate) &&
          (!params.receivingDay || truck.receivingDay === params.receivingDay),
      );
    }
    const detailed = await Promise.all(
      trucks.map(async (truck) => {
        try {
          return (await getInboundTruck(truck.id)) ?? truck;
        } catch {
          return truck;
        }
      }),
    );
    return detailed;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function getInboundTruck(truckId: number): Promise<InboundTruck | null> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_INBOUND_TRUCKS.BY_ID(truckId));
    return normalizeInboundTruckDetail(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function createInboundTruck(
  payload: CreateInboundTruckRequest,
): Promise<InboundTruck> {
  try {
    const { data } = await api.post<unknown>(ENDPOINTS.WMS_INBOUND_TRUCKS.CREATE, payload);
    const detail = normalizeInboundTruckDetail(data);
    if (!detail) throw new Error("Invalid create inbound truck response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function assignRequestToTruck(
  truckId: number,
  inboundRequestId: number,
): Promise<InboundTruck> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_INBOUND_TRUCKS.ASSIGN(truckId, inboundRequestId),
    );
    const detail = normalizeInboundTruckDetail(data);
    if (!detail) throw new Error("Invalid assign inbound truck response");
    return detail;
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function unassignRequestFromTruck(
  truckId: number,
  inboundRequestId: number,
): Promise<InboundTruck | null> {
  try {
    const { data } = await api.delete<unknown>(
      ENDPOINTS.WMS_INBOUND_TRUCKS.ASSIGN(truckId, inboundRequestId),
    );
    return normalizeInboundTruckDetail(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function approveInboundTruck(
  truckId: number,
): Promise<ApproveInboundTruckResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_INBOUND_TRUCKS.APPROVE(truckId),
    );
    return normalizeApproveInboundTruckResult(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function getTransitTrucks(): Promise<TransitTruck[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_INBOUND_TRUCKS.TRANSIT);
    return normalizeTransitTruckList(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}

export async function createReceivingSessionFromTruck(
  truckId: number,
): Promise<CreateReceivingFromTruckResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_INBOUND_TRUCKS.CREATE_RECEIVING_SESSION(truckId),
    );
    const result = normalizeCreateReceivingFromTruckResult(data);
    if (!result) throw new Error("Invalid create receiving session response");
    return result;
  } catch (err: unknown) {
    toInboundError(err);
  }
}
