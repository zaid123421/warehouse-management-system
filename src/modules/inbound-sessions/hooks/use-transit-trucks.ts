import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getTransitTrucks } from "@/modules/inbound-sessions/services/inbound-truck.service";

export function useTransitTrucks(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: inboundQueryKeys.transitTrucks(),
    queryFn: getTransitTrucks,
    enabled,
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}
