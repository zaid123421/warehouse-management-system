import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getOutboundPlanningPool } from "@/modules/outbound-sessions/services/outbound-truck.service";
import type { OutboundPlanningPoolParams } from "@/modules/outbound-sessions/types/outbound-truck";

export function useOutboundPlanningPool(
  params?: OutboundPlanningPoolParams,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: outboundQueryKeys.planningPool(params?.schedulingCellId),
    queryFn: () => getOutboundPlanningPool(params),
    enabled,
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}
