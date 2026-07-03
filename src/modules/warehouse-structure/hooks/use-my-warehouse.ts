import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getMyWarehouse } from "@/modules/warehouse-structure/services/my-warehouse.service";
import type { MyWarehouse } from "@/modules/warehouse-structure/types/my-warehouse";

export const myWarehouseQueryKey = ["warehouse", "my"] as const;

export function useMyWarehouse(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: myWarehouseQueryKey,
    queryFn: (): Promise<MyWarehouse> => getMyWarehouse(),
    enabled,
    staleTime: 60_000,
  });
}
