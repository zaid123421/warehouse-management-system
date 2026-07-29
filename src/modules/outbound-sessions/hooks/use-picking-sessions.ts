import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getPickingSessions } from "@/modules/outbound-sessions/services/picking-session.service";

export function usePickingSessions(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: outboundQueryKeys.pickingSessions(),
    queryFn: getPickingSessions,
    enabled,
    staleTime: 30_000,
  });
}
