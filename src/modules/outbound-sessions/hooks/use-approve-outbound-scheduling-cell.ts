import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  outboundMutationInvalidationKeys,
  outboundQueryKeys,
} from "@/modules/outbound-sessions/hooks/query-keys";
import { approveOutboundSchedulingCell } from "@/modules/outbound-sessions/services/scheduling.service";

export function useApproveOutboundSchedulingCell() {
  const queryClient = useQueryClient();
  const keys = outboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: (cellId: number) => approveOutboundSchedulingCell(cellId),
    onSuccess: (_data, cellId) => {
      void queryClient.invalidateQueries({ queryKey: keys.scheduling });
      void queryClient.invalidateQueries({ queryKey: outboundQueryKeys.schedulingCell(cellId) });
      void queryClient.invalidateQueries({ queryKey: keys.picking });
    },
  });
}
