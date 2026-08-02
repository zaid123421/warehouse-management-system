import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toOutboundError } from "@/modules/outbound-sessions/lib/outbound-error";
import {
  normalizeApproveOutboundTruckResult,
  normalizeConfirmOutboundTruckPlanResult,
  normalizeCreateShippingFromTruckResult,
  normalizeOutboundPlanningPoolList,
  normalizeOutboundTruckDetail,
  normalizeOutboundTruckList,
  normalizeReadyToShipTruckList,
} from "@/modules/outbound-sessions/lib/outbound-truck-dto";
import type {
  ApproveOutboundTruckResult,
  ConfirmOutboundTruckPlanRequest,
  ConfirmOutboundTruckPlanResult,
  CreateOutboundTruckRequest,
  CreateShippingFromTruckResult,
  OutboundTruck,
  OutboundPlanningPoolParams,
  OutboundPlanningPoolRequest,
  ReadyToShipTruck,
} from "@/modules/outbound-sessions/types/outbound-truck";

export async function getOutboundPlanningPool(
  params?: OutboundPlanningPoolParams,
): Promise<OutboundPlanningPoolRequest[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_OUTBOUND_TRUCKS.PLANNING_POOL, {
      params: params?.schedulingCellId
        ? { schedulingCellId: params.schedulingCellId }
        : undefined,
    });
    return normalizeOutboundPlanningPoolList(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function getOutboundPlanningTrucks(params?: {
  serviceDate?: string;
  deliveryDay?: string;
}): Promise<OutboundTruck[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_OUTBOUND_TRUCKS.PLANNING);
    let trucks = normalizeOutboundTruckList(data);
    if (params?.serviceDate || params?.deliveryDay) {
      trucks = trucks.filter(
        (truck) =>
          (!params.serviceDate || truck.serviceDate === params.serviceDate) &&
          (!params.deliveryDay || truck.deliveryDay === params.deliveryDay),
      );
    }
    const detailed = await Promise.all(
      trucks.map(async (truck) => {
        try {
          return (await getOutboundTruck(truck.id)) ?? truck;
        } catch {
          return truck;
        }
      }),
    );
    return detailed;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function getOutboundTruck(truckId: number): Promise<OutboundTruck | null> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_OUTBOUND_TRUCKS.BY_ID(truckId));
    return normalizeOutboundTruckDetail(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function createOutboundTruck(
  payload: CreateOutboundTruckRequest,
): Promise<OutboundTruck> {
  try {
    const { data } = await api.post<unknown>(ENDPOINTS.WMS_OUTBOUND_TRUCKS.CREATE, payload);
    const detail = normalizeOutboundTruckDetail(data);
    if (!detail) throw new Error("Invalid create outbound truck response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function assignOutboundRequestToTruck(
  truckId: number,
  outboundRequestId: number,
): Promise<OutboundTruck> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_OUTBOUND_TRUCKS.ASSIGN(truckId, outboundRequestId),
    );
    const detail = normalizeOutboundTruckDetail(data);
    if (!detail) throw new Error("Invalid assign outbound truck response");
    return detail;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function unassignOutboundRequestFromTruck(
  truckId: number,
  outboundRequestId: number,
): Promise<OutboundTruck | null> {
  try {
    const { data } = await api.delete<unknown>(
      ENDPOINTS.WMS_OUTBOUND_TRUCKS.ASSIGN(truckId, outboundRequestId),
    );
    return normalizeOutboundTruckDetail(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function confirmOutboundTruckPlan(
  payload: ConfirmOutboundTruckPlanRequest,
): Promise<ConfirmOutboundTruckPlanResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_OUTBOUND_TRUCKS.CONFIRM_PLAN,
      payload,
    );
    return normalizeConfirmOutboundTruckPlanResult(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function approveOutboundTruck(
  truckId: number,
): Promise<ApproveOutboundTruckResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_OUTBOUND_TRUCKS.APPROVE(truckId),
    );
    return normalizeApproveOutboundTruckResult(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function deleteOutboundTruck(truckId: number): Promise<void> {
  try {
    await api.delete(ENDPOINTS.WMS_OUTBOUND_TRUCKS.DELETE(truckId));
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function getReadyToShipTrucks(): Promise<ReadyToShipTruck[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_OUTBOUND_TRUCKS.READY_TO_SHIP);
    return normalizeReadyToShipTruckList(data);
  } catch (err: unknown) {
    toOutboundError(err);
  }
}

export async function createShippingSessionFromTruck(
  truckId: number,
): Promise<CreateShippingFromTruckResult> {
  try {
    const { data } = await api.post<unknown>(
      ENDPOINTS.WMS_OUTBOUND_TRUCKS.CREATE_SHIPPING_SESSION(truckId),
    );
    const result = normalizeCreateShippingFromTruckResult(data);
    if (!result) throw new Error("Invalid create shipping session response");
    return result;
  } catch (err: unknown) {
    toOutboundError(err);
  }
}
