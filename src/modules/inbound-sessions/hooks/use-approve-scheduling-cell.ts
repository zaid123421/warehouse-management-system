import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inboundMutationInvalidationKeys,
  inboundQueryKeys,
} from "@/modules/inbound-sessions/hooks/query-keys";
import { approveSchedulingCell } from "@/modules/inbound-sessions/services/scheduling.service";

export function useApproveSchedulingCell() {
  const queryClient = useQueryClient();
  const keys = inboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: (cellId: number) => approveSchedulingCell(cellId),
    onSuccess: (_data, cellId) => {
      void queryClient.invalidateQueries({ queryKey: keys.scheduling });
      void queryClient.invalidateQueries({ queryKey: inboundQueryKeys.schedulingCell(cellId) });
      void queryClient.invalidateQueries({ queryKey: keys.requests });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
