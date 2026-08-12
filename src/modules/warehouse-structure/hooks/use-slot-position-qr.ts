import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getSlotPositionQrPage } from "@/modules/warehouse-structure/services/slot-position-qr.service";
import {
  SLOT_POSITION_QR_DEFAULT_PAGE_SIZE,
  type SlotPositionQrPage,
} from "@/modules/warehouse-structure/types/slot-position-qr";

export const slotPositionQrQueryKey = (slotId: number, page: number, size: number) =>
  ["warehouse", "slots", "storage-position-qr", slotId, page, size] as const;

export function useSlotPositionQr(
  slotId: number | null,
  page: number,
  options?: { enabled?: boolean; size?: number },
) {
  const size = options?.size ?? SLOT_POSITION_QR_DEFAULT_PAGE_SIZE;
  const enabled =
    (options?.enabled ?? true) &&
    slotId != null &&
    slotId > 0 &&
    Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: slotPositionQrQueryKey(slotId ?? 0, page, size),
    queryFn: (): Promise<SlotPositionQrPage> =>
      getSlotPositionQrPage(slotId as number, { page, size }),
    enabled,
    staleTime: 60_000,
  });
}
