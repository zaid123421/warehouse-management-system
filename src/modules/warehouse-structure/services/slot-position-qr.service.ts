import axios from "axios";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { ENDPOINTS } from "@/services/endpoints";
import { normalizeSlotPositionQrPage } from "@/modules/warehouse-structure/lib/slot-position-qr-dto";
import type { SlotPositionQrPage } from "@/modules/warehouse-structure/types/slot-position-qr";

export class SlotPositionQrError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "SlotPositionQrError";
  }
}

function toQrError(err: unknown): never {
  if (err instanceof SlotPositionQrError) throw err;
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      getApiErrorMessage(err.response?.data) ?? err.message ?? "Request failed";
    throw new SlotPositionQrError(msg, status);
  }
  if (err instanceof Error) throw new SlotPositionQrError(err.message);
  throw new SlotPositionQrError("Request failed");
}

export async function getSlotPositionQrPage(
  slotId: number,
  params?: { page?: number; size?: number },
): Promise<SlotPositionQrPage> {
  if (!Number.isFinite(slotId) || slotId <= 0) {
    throw new SlotPositionQrError("slotId is required");
  }

  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_SLOTS.STORAGE_POSITION_QR(slotId), {
      params: {
        ...(params?.page != null ? { page: params.page } : {}),
        ...(params?.size != null ? { size: params.size } : {}),
      },
    });
    return normalizeSlotPositionQrPage(data);
  } catch (err: unknown) {
    toQrError(err);
  }
}
