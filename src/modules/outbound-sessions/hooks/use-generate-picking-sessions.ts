import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outboundMutationInvalidationKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { generatePickingSessions } from "@/modules/outbound-sessions/services/scheduling.service";
import type { GeneratePickingSessionsRequest } from "@/modules/outbound-sessions/types/scheduling";

export function useGeneratePickingSessions() {
  const queryClient = useQueryClient();
  const keys = outboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: (payload?: GeneratePickingSessionsRequest) => generatePickingSessions(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.picking });
      void queryClient.invalidateQueries({ queryKey: keys.scheduling });
    },
  });
}
