import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getInboundRequestById } from "@/modules/inbound-sessions/services/inbound-request.service";

export function useInboundRequestDetail(
  requestId: number,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    requestId > 0;
  return useQuery({
    queryKey: inboundQueryKeys.inboundRequest(requestId),
    queryFn: () => getInboundRequestById(requestId),
    enabled,
    staleTime: 30_000,
  });
}
