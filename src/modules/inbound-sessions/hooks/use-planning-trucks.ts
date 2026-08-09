import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getPlanningTrucks } from "@/modules/inbound-sessions/services/inbound-truck.service";

type UsePlanningTrucksParams = {
  schedulingCellId?: number;
  serviceDate?: string;
  receivingDay?: string;
};

export function usePlanningTrucks(
  params?: UsePlanningTrucksParams,
  options?: { enabled?: boolean },
) {
  const hasFilter = Boolean(
    params?.schedulingCellId && params?.serviceDate && params?.receivingDay,
  );
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    (params == null || hasFilter);

  const filter = hasFilter
    ? {
        schedulingCellId: params?.schedulingCellId,
        serviceDate: params?.serviceDate,
        receivingDay: params?.receivingDay,
      }
    : undefined;

  return useQuery({
    queryKey: inboundQueryKeys.planningTrucks(filter),
    queryFn: () => getPlanningTrucks(filter),
    enabled,
    staleTime: 30_000,
    refetchInterval: 15_000,
  });
}
