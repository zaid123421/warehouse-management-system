import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inboundMutationInvalidationKeys,
} from "@/modules/inbound-sessions/hooks/query-keys";
import { generateReceivingSessions } from "@/modules/inbound-sessions/services/scheduling.service";
import type { GenerateReceivingSessionsRequest } from "@/modules/inbound-sessions/types/scheduling";

export function useGenerateReceivingSessions() {
  const queryClient = useQueryClient();
  const keys = inboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: (payload: GenerateReceivingSessionsRequest) =>
      generateReceivingSessions(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.receiving });
      void queryClient.invalidateQueries({ queryKey: keys.requests });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
