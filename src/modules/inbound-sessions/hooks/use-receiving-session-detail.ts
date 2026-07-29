import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getReceivingSessionById } from "@/modules/inbound-sessions/services/receiving-session.service";

export function useReceivingSessionDetail(
  sessionId: number,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    sessionId > 0;
  return useQuery({
    queryKey: inboundQueryKeys.receivingSession(sessionId),
    queryFn: () => getReceivingSessionById(sessionId),
    enabled,
    staleTime: 15_000,
  });
}
