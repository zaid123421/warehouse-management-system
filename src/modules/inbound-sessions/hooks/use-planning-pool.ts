import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getPlanningPool } from "@/modules/inbound-sessions/services/inbound-truck.service";
import type { PlanningPoolParams } from "@/modules/inbound-sessions/types/inbound-truck";

export function usePlanningPool(
  params?: PlanningPoolParams,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: inboundQueryKeys.planningPool(params?.schedulingCellId),
    queryFn: () => getPlanningPool(params),
    enabled,
    staleTime: 30_000,
  });
}
