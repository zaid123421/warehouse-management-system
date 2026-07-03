import axios from "axios";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ENDPOINTS } from "@/services/endpoints";
import {
  normalizePaginatedResponse,
  normalizeWarehousePosition,
  normalizeWarehouseRack,
  normalizeWarehouseRow,
  normalizeWarehouseSlot,
  normalizeWarehouseZone,
} from "@/modules/warehouse-structure/lib/warehouse-visualization-dto";
import type {
  PaginatedResult,
  VisualizationQueryParams,
  WarehousePosition,
  WarehouseRack,
  WarehouseRow,
  WarehouseSlot,
  WarehouseZone,
} from "@/modules/warehouse-structure/types/warehouse-visualization";

export class WarehouseVisualizationError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "WarehouseVisualizationError";
  }
}

function toVisualizationError(err: unknown): never {
  if (err instanceof WarehouseVisualizationError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
    throw new WarehouseVisualizationError(msg, status);
  }
  if (err instanceof Error) throw new WarehouseVisualizationError(err.message);
  throw new WarehouseVisualizationError("Request failed");
}

function buildQueryParams(params?: VisualizationQueryParams): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};
  if (params?.page != null) query.page = params.page;
  if (params?.size != null) query.size = params.size;
  if (params?.sortBy) query.sortBy = params.sortBy;
  if (params?.direction) query.direction = params.direction;
  if (params?.includePositions != null) query.includePositions = params.includePositions;
  return query;
}

export async function getWarehouseZones(
  params?: VisualizationQueryParams,
): Promise<PaginatedResult<WarehouseZone>> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_WAREHOUSE_VISUALIZATION.ZONES, {
      params: buildQueryParams(params),
    });
    return normalizePaginatedResponse(data, normalizeWarehouseZone);
  } catch (err: unknown) {
    toVisualizationError(err);
  }
}

export async function getZoneRows(
  zoneId: number,
  params?: VisualizationQueryParams,
): Promise<PaginatedResult<WarehouseRow>> {
  try {
    const { data } = await api.get<unknown>(
      ENDPOINTS.WMS_WAREHOUSE_VISUALIZATION.ZONE_ROWS(zoneId),
      { params: buildQueryParams(params) },
    );
    return normalizePaginatedResponse(data, normalizeWarehouseRow);
  } catch (err: unknown) {
    toVisualizationError(err);
  }
}

export async function getRowRacks(
  rowId: number,
  params?: VisualizationQueryParams,
): Promise<PaginatedResult<WarehouseRack>> {
  try {
    const { data } = await api.get<unknown>(
      ENDPOINTS.WMS_WAREHOUSE_VISUALIZATION.ROW_RACKS(rowId),
      { params: buildQueryParams(params) },
    );
    return normalizePaginatedResponse(data, normalizeWarehouseRack);
  } catch (err: unknown) {
    toVisualizationError(err);
  }
}

export async function getRackSlots(
  rackId: number,
  params?: VisualizationQueryParams,
): Promise<PaginatedResult<WarehouseSlot>> {
  try {
    const { data } = await api.get<unknown>(
      ENDPOINTS.WMS_WAREHOUSE_VISUALIZATION.RACK_SLOTS(rackId),
      { params: buildQueryParams(params) },
    );
    return normalizePaginatedResponse(data, normalizeWarehouseSlot);
  } catch (err: unknown) {
    toVisualizationError(err);
  }
}

export async function getSlotPositions(
  slotId: number,
  params?: VisualizationQueryParams,
): Promise<PaginatedResult<WarehousePosition>> {
  try {
    const { data } = await api.get<unknown>(
      ENDPOINTS.WMS_WAREHOUSE_VISUALIZATION.SLOT_POSITIONS(slotId),
      { params: buildQueryParams(params) },
    );
    return normalizePaginatedResponse(data, normalizeWarehousePosition);
  } catch (err: unknown) {
    toVisualizationError(err);
  }
}
