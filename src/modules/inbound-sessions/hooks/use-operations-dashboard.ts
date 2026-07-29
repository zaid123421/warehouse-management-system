import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getOperationsDashboard } from "@/modules/inbound-sessions/services/operations-dashboard.service";

export function useOperationsDashboard(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: inboundQueryKeys.operationsDashboard(),
    queryFn: getOperationsDashboard,
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
