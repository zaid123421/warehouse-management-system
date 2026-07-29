import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getOutboundSchedulingBoard } from "@/modules/outbound-sessions/services/scheduling.service";

export function useOutboundSchedulingBoard(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: outboundQueryKeys.schedulingBoard(),
    queryFn: getOutboundSchedulingBoard,
    enabled,
    staleTime: 60_000,
  });
}
