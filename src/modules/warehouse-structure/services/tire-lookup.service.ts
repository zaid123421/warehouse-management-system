import axios from "axios";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ENDPOINTS } from "@/services/endpoints";
import { normalizeTireLookupResult } from "@/modules/warehouse-structure/lib/tire-and-position-history-dto";
import type { TireLookupResult } from "@/modules/warehouse-structure/types/tire-lookup";

export class TireLookupError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "TireLookupError";
  }
}

function toTireLookupError(err: unknown): never {
  if (err instanceof TireLookupError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
    throw new TireLookupError(msg, status);
  }
  if (err instanceof Error) throw new TireLookupError(err.message);
  throw new TireLookupError("Request failed");
}

export async function lookupTireByUniqueId(uniqueId: string): Promise<TireLookupResult> {
  const trimmed = uniqueId.trim();
  if (!trimmed) throw new TireLookupError("uniqueId is required");

  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_TIRES.LOOKUP, {
      params: { uniqueId: trimmed },
    });
    const result = normalizeTireLookupResult(data);
    if (!result) throw new TireLookupError("Invalid tire lookup response");
    return result;
  } catch (err: unknown) {
    toTireLookupError(err);
  }
}
