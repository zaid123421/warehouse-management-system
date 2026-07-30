import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getPutawaySessions } from "@/modules/inbound-sessions/services/putaway-session.service";

import type { PutawaySession } from "@/modules/inbound-sessions/types/putaway-session";

export function usePutawaySessions(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery<PutawaySession[]>({
    queryKey: inboundQueryKeys.putawaySessions(),
    queryFn: () => getPutawaySessions(),
    enabled,
    staleTime: 30_000,
  });
}
