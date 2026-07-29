import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getReceivingSessions } from "@/modules/inbound-sessions/services/receiving-session.service";

export function useReceivingSessions(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: inboundQueryKeys.receivingSessions(),
    queryFn: getReceivingSessions,
    enabled,
    staleTime: 30_000,
  });
}
