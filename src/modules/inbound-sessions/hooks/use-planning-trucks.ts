import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getPlanningTrucks } from "@/modules/inbound-sessions/services/inbound-truck.service";

type UsePlanningTrucksParams = {
  serviceDate?: string;
  receivingDay?: string;
};

export function usePlanningTrucks(
  params?: UsePlanningTrucksParams,
  options?: { enabled?: boolean },
) {
  const hasFilter = Boolean(params?.serviceDate && params?.receivingDay);
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    (params == null || hasFilter);

  return useQuery({
    queryKey: inboundQueryKeys.planningTrucks(
      hasFilter
        ? { serviceDate: params?.serviceDate, receivingDay: params?.receivingDay }
        : undefined,
    ),
    queryFn: () =>
      getPlanningTrucks(
        hasFilter
          ? { serviceDate: params?.serviceDate, receivingDay: params?.receivingDay }
          : undefined,
      ),
    enabled,
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}
