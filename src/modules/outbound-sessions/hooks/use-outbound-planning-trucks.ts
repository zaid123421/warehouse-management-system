import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getOutboundPlanningTrucks } from "@/modules/outbound-sessions/services/outbound-truck.service";

type UseOutboundPlanningTrucksParams = {
  schedulingCellId?: number;
  serviceDate?: string;
  deliveryDay?: string;
};

export function useOutboundPlanningTrucks(
  params?: UseOutboundPlanningTrucksParams,
  options?: { enabled?: boolean },
) {
  const hasFilter = Boolean(params?.schedulingCellId && params?.serviceDate);
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    (params == null || hasFilter);

  const filter = hasFilter
    ? {
        schedulingCellId: params?.schedulingCellId,
        serviceDate: params?.serviceDate,
        deliveryDay: params?.deliveryDay,
      }
    : undefined;

  return useQuery({
    queryKey: outboundQueryKeys.planningTrucks(filter),
    queryFn: () => getOutboundPlanningTrucks(filter),
    enabled,
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}
