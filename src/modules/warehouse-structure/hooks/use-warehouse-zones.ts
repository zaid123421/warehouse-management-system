import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getWarehouseZones } from "@/modules/warehouse-structure/services/warehouse-visualization.service";
import {
  VISUALIZATION_DEFAULT_PAGE_SIZE,
  type PaginatedResult,
  type VisualizationQueryParams,
  type WarehouseZone,
} from "@/modules/warehouse-structure/types/warehouse-visualization";

export const warehouseZonesQueryKey = (page: number, size: number) =>
  ["warehouse-viz", "zones", page, size] as const;

export function useWarehouseZones(
  page: number,
  options?: { enabled?: boolean; size?: number },
) {
  const size = options?.size ?? VISUALIZATION_DEFAULT_PAGE_SIZE;
  const enabled =
    (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: warehouseZonesQueryKey(page, size),
    queryFn: (): Promise<PaginatedResult<WarehouseZone>> =>
      getWarehouseZones({ page, size } satisfies VisualizationQueryParams),
    enabled,
    staleTime: 60_000,
  });
}
