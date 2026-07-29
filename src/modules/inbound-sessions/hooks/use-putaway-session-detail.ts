import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getPutawaySessionById } from "@/modules/inbound-sessions/services/putaway-session.service";

export function usePutawaySessionDetail(
  sessionId: number,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    sessionId > 0;
  return useQuery({
    queryKey: inboundQueryKeys.putawaySession(sessionId),
    queryFn: () => getPutawaySessionById(sessionId),
    enabled,
    staleTime: 15_000,
  });
}
