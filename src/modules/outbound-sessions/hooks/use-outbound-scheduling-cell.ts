import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { outboundQueryKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { getOutboundSchedulingCellDetail } from "@/modules/outbound-sessions/services/scheduling.service";

export function useOutboundSchedulingCell(cellId: number | null, options?: { enabled?: boolean }) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    cellId != null &&
    cellId > 0;
  return useQuery({
    queryKey: outboundQueryKeys.schedulingCell(cellId ?? 0),
    queryFn: () => getOutboundSchedulingCellDetail(cellId as number),
    enabled,
    staleTime: 30_000,
  });
}
