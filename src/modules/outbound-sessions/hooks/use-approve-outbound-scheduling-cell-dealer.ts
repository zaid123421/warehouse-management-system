import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  outboundMutationInvalidationKeys,
  outboundQueryKeys,
} from "@/modules/outbound-sessions/hooks/query-keys";
import { approveOutboundSchedulingCellDealer } from "@/modules/outbound-sessions/services/scheduling.service";

export function useApproveOutboundSchedulingCellDealer() {
  const queryClient = useQueryClient();
  const keys = outboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: ({
      cellId,
      dealerId,
      version,
    }: {
      cellId: number;
      dealerId: number;
      version?: number | null;
    }) => approveOutboundSchedulingCellDealer(cellId, dealerId, version),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: keys.scheduling });
      void queryClient.invalidateQueries({
        queryKey: outboundQueryKeys.schedulingCell(variables.cellId),
      });
      void queryClient.invalidateQueries({ queryKey: keys.planningPool });
      void queryClient.invalidateQueries({ queryKey: keys.picking });
    },
  });
}
