import axios from "axios";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ENDPOINTS } from "@/services/endpoints";
import {
  normalizeStaffAssignment,
  normalizeStaffList,
} from "@/modules/employees/lib/warehouse-staff-dto";
import type {
  CreateStaffRequest,
  UpdateStaffRequest,
  UpdateStaffStatusRequest,
  WarehouseStaffAssignment,
} from "@/modules/employees/types/warehouse-staff";

export class WarehouseStaffError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "WarehouseStaffError";
  }
}

function toStaffError(err: unknown): never {
  if (err instanceof WarehouseStaffError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
    throw new WarehouseStaffError(msg, status);
  }
  if (err instanceof Error) throw new WarehouseStaffError(err.message);
  throw new WarehouseStaffError("Request failed");
}

export async function getWarehouseStaffList(): Promise<WarehouseStaffAssignment[]> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_STAFF.LIST);
    return normalizeStaffList(data);
  } catch (err: unknown) {
    toStaffError(err);
  }
}

export async function getWarehouseStaffById(userId: number): Promise<WarehouseStaffAssignment> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_STAFF.BY_ID(userId));
    const assignment =
      normalizeStaffAssignment(data) ??
      normalizeStaffAssignment(unwrapInner(data));
    if (!assignment) throw new WarehouseStaffError("Invalid staff response");
    return assignment;
  } catch (err: unknown) {
    toStaffError(err);
  }
}

function unwrapInner(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const rec = data as Record<string, unknown>;
  return rec.data ?? data;
}

export async function createWarehouseStaff(payload: CreateStaffRequest): Promise<void> {
  try {
    await api.post(ENDPOINTS.WMS_STAFF.LIST, payload);
  } catch (err: unknown) {
    toStaffError(err);
  }
}

export async function updateWarehouseStaff(
  userId: number,
  payload: UpdateStaffRequest,
): Promise<void> {
  try {
    await api.put(ENDPOINTS.WMS_STAFF.BY_ID(userId), payload);
  } catch (err: unknown) {
    toStaffError(err);
  }
}

export async function updateWarehouseStaffStatus(
  userId: number,
  payload: UpdateStaffStatusRequest,
): Promise<void> {
  try {
    await api.patch(ENDPOINTS.WMS_STAFF.STATUS(userId), payload);
  } catch (err: unknown) {
    toStaffError(err);
  }
}

export async function deleteWarehouseStaff(userId: number): Promise<void> {
  try {
    await api.delete(ENDPOINTS.WMS_STAFF.BY_ID(userId));
  } catch (err: unknown) {
    toStaffError(err);
  }
}
