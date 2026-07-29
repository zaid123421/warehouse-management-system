import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inboundMutationInvalidationKeys,
  inboundQueryKeys,
} from "@/modules/inbound-sessions/hooks/query-keys";
import { acceptInboundRequest } from "@/modules/inbound-sessions/services/inbound-request.service";

export function useAcceptInboundRequest() {
  const queryClient = useQueryClient();
  const keys = inboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: (requestId: number) => acceptInboundRequest(requestId),
    onSuccess: (data, requestId) => {
      queryClient.setQueryData(inboundQueryKeys.inboundRequest(requestId), data);
      void queryClient.invalidateQueries({ queryKey: keys.requests });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
