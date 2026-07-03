import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getRowRacks } from "@/modules/warehouse-structure/services/warehouse-visualization.service";
import {
  VISUALIZATION_DEFAULT_PAGE_SIZE,
  type PaginatedResult,
  type WarehouseRack,
} from "@/modules/warehouse-structure/types/warehouse-visualization";

export const rowRacksQueryKey = (rowId: number, page: number, size: number) =>
  ["warehouse-viz", "racks", rowId, page, size] as const;

export function useRowRacks(
  rowId: number | null,
  page: number,
  options?: { enabled?: boolean; size?: number },
) {
  const size = options?.size ?? VISUALIZATION_DEFAULT_PAGE_SIZE;
  const enabled =
    (options?.enabled ?? true) &&
    rowId != null &&
    Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: rowRacksQueryKey(rowId ?? 0, page, size),
    queryFn: (): Promise<PaginatedResult<WarehouseRack>> =>
      getRowRacks(rowId as number, { page, size }),
    enabled,
    staleTime: 60_000,
  });
}
