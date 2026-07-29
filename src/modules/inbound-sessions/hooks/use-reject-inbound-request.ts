import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inboundMutationInvalidationKeys,
  inboundQueryKeys,
} from "@/modules/inbound-sessions/hooks/query-keys";
import { rejectInboundRequest } from "@/modules/inbound-sessions/services/inbound-request.service";

export function useRejectInboundRequest() {
  const queryClient = useQueryClient();
  const keys = inboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: (requestId: number) => rejectInboundRequest(requestId),
    onSuccess: (data, requestId) => {
      queryClient.setQueryData(inboundQueryKeys.inboundRequest(requestId), data);
      void queryClient.invalidateQueries({ queryKey: keys.requests });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    },
  });
}
