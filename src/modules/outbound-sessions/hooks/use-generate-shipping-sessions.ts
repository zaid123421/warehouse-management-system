import { useMutation, useQueryClient } from "@tanstack/react-query";
import { outboundMutationInvalidationKeys } from "@/modules/outbound-sessions/hooks/query-keys";
import { generateShippingSessions } from "@/modules/outbound-sessions/services/shipping-session.service";
import type { GenerateShippingSessionsRequest } from "@/modules/outbound-sessions/types/shipping-session";

export function useGenerateShippingSessions() {
  const queryClient = useQueryClient();
  const keys = outboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: (payload?: GenerateShippingSessionsRequest) =>
      generateShippingSessions(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.shipping });
      void queryClient.invalidateQueries({ queryKey: keys.picking });
    },
  });
}
