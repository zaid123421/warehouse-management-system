import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getOutboundPlanningTrucks } from "@/modules/outbound-sessions/services/outbound-truck.service";

type UseOutboundPlanningTrucksParams = {
  serviceDate?: string;
  deliveryDay?: string;
};

export function useOutboundPlanningTrucks(
  params?: UseOutboundPlanningTrucksParams,
  options?: { enabled?: boolean },
) {
  const hasFilter = Boolean(params?.serviceDate);
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    (params == null || hasFilter);

  return useQuery({
    queryKey: outboundQueryKeys.planningTrucks(
      hasFilter
        ? { serviceDate: params?.serviceDate, deliveryDay: params?.deliveryDay }
        : undefined,
    ),
    queryFn: () =>
      getOutboundPlanningTrucks(
        hasFilter
          ? { serviceDate: params?.serviceDate, deliveryDay: params?.deliveryDay }
          : undefined,
      ),
    enabled,
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}
