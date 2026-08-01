import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getReadyToShipTrucks } from "@/modules/outbound-sessions/services/outbound-truck.service";

export function useReadyToShipTrucks(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: outboundQueryKeys.readyToShipTrucks(),
    queryFn: getReadyToShipTrucks,
    enabled,
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}
