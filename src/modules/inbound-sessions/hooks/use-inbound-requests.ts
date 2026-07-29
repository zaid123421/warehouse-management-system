import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getInboundRequests } from "@/modules/inbound-sessions/services/inbound-request.service";
import type { InboundRequestListParams } from "@/modules/inbound-sessions/types/inbound-request";

export function useInboundRequests(
  params?: InboundRequestListParams,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  const status = params?.status;
  return useQuery({
    queryKey: inboundQueryKeys.inboundRequests(status),
    queryFn: () => getInboundRequests(params),
    enabled,
    staleTime: 30_000,
  });
}
