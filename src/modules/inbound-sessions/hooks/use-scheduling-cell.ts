import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getSchedulingCellDetail } from "@/modules/inbound-sessions/services/scheduling.service";

export function useSchedulingCell(cellId: number | null, options?: { enabled?: boolean }) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(TokenService.getAccessToken()) &&
    cellId != null &&
    cellId > 0;
  return useQuery({
    queryKey: inboundQueryKeys.schedulingCell(cellId ?? 0),
    queryFn: () => getSchedulingCellDetail(cellId as number),
    enabled,
    staleTime: 30_000,
  });
}
