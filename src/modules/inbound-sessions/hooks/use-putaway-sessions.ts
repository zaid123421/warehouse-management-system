import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getPutawaySessions } from "@/modules/inbound-sessions/services/putaway-session.service";

export function usePutawaySessions(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: inboundQueryKeys.putawaySessions(),
    queryFn: getPutawaySessions,
    enabled,
    staleTime: 30_000,
  });
}
