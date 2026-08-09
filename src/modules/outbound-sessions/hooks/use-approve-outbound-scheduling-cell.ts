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
    mutationFn: ({
      cellId,
      version,
    }: {
      cellId: number;
      version?: number | null;
    }) => approveOutboundSchedulingCell(cellId, version),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: keys.scheduling });
      void queryClient.invalidateQueries({
        queryKey: outboundQueryKeys.schedulingCell(variables.cellId),
      });
      void queryClient.invalidateQueries({ queryKey: keys.picking });
    },
  });
}
