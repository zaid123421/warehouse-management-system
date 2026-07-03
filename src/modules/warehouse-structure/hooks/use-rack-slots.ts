import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getRackSlots } from "@/modules/warehouse-structure/services/warehouse-visualization.service";
import {
  VISUALIZATION_DEFAULT_PAGE_SIZE,
  type PaginatedResult,
  type WarehouseSlot,
} from "@/modules/warehouse-structure/types/warehouse-visualization";

export const rackSlotsQueryKey = (rackId: number, page: number, size: number) =>
  ["warehouse-viz", "slots", rackId, page, size] as const;

export function useRackSlots(
  rackId: number | null,
  page: number,
  options?: { enabled?: boolean; size?: number },
) {
  const size = options?.size ?? VISUALIZATION_DEFAULT_PAGE_SIZE;
  const enabled =
    (options?.enabled ?? true) &&
    rackId != null &&
    Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: rackSlotsQueryKey(rackId ?? 0, page, size),
    queryFn: (): Promise<PaginatedResult<WarehouseSlot>> =>
      getRackSlots(rackId as number, { page, size }),
    enabled,
    staleTime: 60_000,
  });
}
