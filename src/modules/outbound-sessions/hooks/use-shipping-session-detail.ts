import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getShippingSessionById } from "@/modules/outbound-sessions/services/shipping-session.service";

export function useShippingSessionDetail(
  sessionId: number | null,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    sessionId != null &&
    sessionId > 0;
  return useQuery({
    queryKey: outboundQueryKeys.shippingSession(sessionId ?? 0),
    queryFn: () => getShippingSessionById(sessionId as number),
    enabled,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });
}
