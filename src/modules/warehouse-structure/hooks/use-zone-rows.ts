import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getZoneRows } from "@/modules/warehouse-structure/services/warehouse-visualization.service";
import {
  VISUALIZATION_DEFAULT_PAGE_SIZE,
  type PaginatedResult,
  type WarehouseRow,
} from "@/modules/warehouse-structure/types/warehouse-visualization";

export const zoneRowsQueryKey = (zoneId: number, page: number, size: number) =>
  ["warehouse-viz", "rows", zoneId, page, size] as const;

export function useZoneRows(
  zoneId: number | null,
  page: number,
  options?: { enabled?: boolean; size?: number },
) {
  const size = options?.size ?? VISUALIZATION_DEFAULT_PAGE_SIZE;
  const enabled =
    (options?.enabled ?? true) &&
    zoneId != null &&
    Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: zoneRowsQueryKey(zoneId ?? 0, page, size),
    queryFn: (): Promise<PaginatedResult<WarehouseRow>> =>
      getZoneRows(zoneId as number, { page, size }),
    enabled,
    staleTime: 60_000,
  });
}
