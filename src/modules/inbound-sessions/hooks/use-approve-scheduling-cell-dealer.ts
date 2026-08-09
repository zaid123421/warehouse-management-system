import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inboundMutationInvalidationKeys,
  inboundQueryKeys,
} from "@/modules/inbound-sessions/hooks/query-keys";
import { approveSchedulingCellDealer } from "@/modules/inbound-sessions/services/scheduling.service";

export function useApproveSchedulingCellDealer() {
  const queryClient = useQueryClient();
  const keys = inboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: ({
      cellId,
      dealerId,
      version,
    }: {
      cellId: number;
      dealerId: number;
      version?: number | null;
    }) => approveSchedulingCellDealer(cellId, dealerId, version),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: keys.scheduling });
      void queryClient.invalidateQueries({
        queryKey: inboundQueryKeys.schedulingCell(variables.cellId),
      });
      void queryClient.invalidateQueries({ queryKey: keys.planningPool });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
