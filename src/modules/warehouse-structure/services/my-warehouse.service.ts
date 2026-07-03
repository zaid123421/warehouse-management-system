import axios from "axios";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ENDPOINTS } from "@/services/endpoints";
import { normalizeMyWarehouseResponse } from "@/modules/warehouse-structure/lib/my-warehouse-dto";
import type {
  InitiateWarehouseRequest,
  MyWarehouse,
} from "@/modules/warehouse-structure/types/my-warehouse";

export class MyWarehouseError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "MyWarehouseError";
  }
}

function toMyWarehouseError(err: unknown): never {
  if (err instanceof MyWarehouseError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
    throw new MyWarehouseError(msg, status);
  }
  if (err instanceof Error) throw new MyWarehouseError(err.message);
  throw new MyWarehouseError("Request failed");
}

export async function getMyWarehouse(): Promise<MyWarehouse> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_WAREHOUSE.MY);
    return normalizeMyWarehouseResponse(data);
  } catch (err: unknown) {
    toMyWarehouseError(err);
  }
}

export async function initiateWarehouse(payload: InitiateWarehouseRequest): Promise<void> {
  try {
    await api.post(ENDPOINTS.WMS_WAREHOUSE.INITIATE, payload);
  } catch (err: unknown) {
    toMyWarehouseError(err);
  }
}
