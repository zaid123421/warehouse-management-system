import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getShippingSessions } from "@/modules/outbound-sessions/services/shipping-session.service";

export function useShippingSessions(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: outboundQueryKeys.shippingSessions(),
    queryFn: getShippingSessions,
    enabled,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}
