import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { inboundQueryKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { getSchedulingBoard } from "@/modules/inbound-sessions/services/scheduling.service";

export function useSchedulingBoard(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());
  return useQuery({
    queryKey: inboundQueryKeys.schedulingBoard(),
    queryFn: getSchedulingBoard,
    enabled,
    staleTime: 60_000,
  });
}
