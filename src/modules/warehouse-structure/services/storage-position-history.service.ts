import axios from "axios";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ENDPOINTS } from "@/services/endpoints";
import { normalizeStoragePositionHistory } from "@/modules/warehouse-structure/lib/tire-and-position-history-dto";
import type { StoragePositionHistoryEntry } from "@/modules/warehouse-structure/types/storage-position-history";

export class StoragePositionHistoryError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "StoragePositionHistoryError";
  }
}

function toHistoryError(err: unknown): never {
  if (err instanceof StoragePositionHistoryError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
    throw new StoragePositionHistoryError(msg, status);
  }
  if (err instanceof Error) throw new StoragePositionHistoryError(err.message);
  throw new StoragePositionHistoryError("Request failed");
}

export async function getStoragePositionHistory(
  storagePositionId: number,
): Promise<StoragePositionHistoryEntry[]> {
  if (!Number.isFinite(storagePositionId) || storagePositionId <= 0) {
    throw new StoragePositionHistoryError("storagePositionId is required");
  }

  try {
    const { data } = await api.get<unknown>(
      ENDPOINTS.WMS_STORAGE_POSITIONS.HISTORY(storagePositionId),
    );
    return normalizeStoragePositionHistory(data);
  } catch (err: unknown) {
    toHistoryError(err);
  }
}
