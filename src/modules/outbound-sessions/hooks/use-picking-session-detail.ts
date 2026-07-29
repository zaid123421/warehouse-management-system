import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getPickingSessionById } from "@/modules/outbound-sessions/services/picking-session.service";

export function usePickingSessionDetail(sessionId: number, options?: { enabled?: boolean }) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    sessionId > 0;
  return useQuery({
    queryKey: outboundQueryKeys.pickingSession(sessionId),
    queryFn: () => getPickingSessionById(sessionId),
    enabled,
    staleTime: 15_000,
  });
}
