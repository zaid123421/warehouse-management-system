import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getOutboundSchedulingBoard } from "@/modules/outbound-sessions/services/scheduling.service";

export function useOutboundSchedulingBoard(options?: {
  enabled?: boolean;
  weekStart?: string;
}) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  const weekStart = options?.weekStart;
  return useQuery({
    queryKey: outboundQueryKeys.schedulingBoard(weekStart),
    queryFn: () => getOutboundSchedulingBoard(weekStart),
    enabled,
    staleTime: 60_000,
  });
}
