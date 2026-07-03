import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getSlotPositions } from "@/modules/warehouse-structure/services/warehouse-visualization.service";
import {
  VISUALIZATION_DEFAULT_PAGE_SIZE,
  type PaginatedResult,
  type WarehousePosition,
} from "@/modules/warehouse-structure/types/warehouse-visualization";

export const slotPositionsQueryKey = (slotId: number, page: number, size: number) =>
  ["warehouse-viz", "positions", slotId, page, size] as const;

export function useSlotPositions(
  slotId: number | null,
  page: number,
  options?: { enabled?: boolean; size?: number },
) {
  const size = options?.size ?? VISUALIZATION_DEFAULT_PAGE_SIZE;
  const enabled =
    (options?.enabled ?? true) &&
    slotId != null &&
    Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: slotPositionsQueryKey(slotId ?? 0, page, size),
    queryFn: (): Promise<PaginatedResult<WarehousePosition>> =>
      getSlotPositions(slotId as number, { page, size }),
    enabled,
    staleTime: 60_000,
  });
}
