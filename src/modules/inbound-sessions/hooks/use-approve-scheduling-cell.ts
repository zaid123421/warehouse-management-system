import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inboundMutationInvalidationKeys } from "@/modules/inbound-sessions/hooks/query-keys";
import { approveSchedulingCell } from "@/modules/inbound-sessions/services/scheduling.service";

export function useApproveSchedulingCell() {
  const queryClient = useQueryClient();
  const keys = inboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: ({
      cellId,
      version,
    }: {
      cellId: number;
      version?: number | null;
    }) => approveSchedulingCell(cellId, version),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.scheduling });
      void queryClient.invalidateQueries({ queryKey: keys.planningPool });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
