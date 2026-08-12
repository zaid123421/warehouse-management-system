import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getWarehouseOverview } from "@/modules/warehouse-overview/services/warehouse-overview.service";
import type { WarehouseOverview } from "@/modules/warehouse-overview/types/warehouse-overview";

export const warehouseOverviewQueryKey = ["warehouse", "overview"] as const;

export function useWarehouseOverview(options?: { enabled?: boolean }) {
  const enabled =
    (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: warehouseOverviewQueryKey,
    queryFn: (): Promise<WarehouseOverview> => getWarehouseOverview(),
    enabled,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
