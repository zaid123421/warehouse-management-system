import axios from "axios";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ENDPOINTS } from "@/services/endpoints";
import { normalizeWarehouseOverview } from "@/modules/warehouse-overview/lib/warehouse-overview-dto";
import type { WarehouseOverview } from "@/modules/warehouse-overview/types/warehouse-overview";

export class WarehouseOverviewError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "WarehouseOverviewError";
  }
}

function toOverviewError(err: unknown): never {
  if (err instanceof WarehouseOverviewError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
    throw new WarehouseOverviewError(msg, status);
  }
  if (err instanceof Error) throw new WarehouseOverviewError(err.message);
  throw new WarehouseOverviewError("Request failed");
}

export async function getWarehouseOverview(): Promise<WarehouseOverview> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_WAREHOUSE.OVERVIEW);
    return normalizeWarehouseOverview(data);
  } catch (err: unknown) {
    toOverviewError(err);
  }
}
