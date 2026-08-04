import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  outboundMutationInvalidationKeys,
  outboundQueryKeys,
} from "@/modules/outbound-sessions/hooks/query-keys";
import {
  approveShippingSession,
  assignShippingSession,
  cancelShippingSession,
  completeShippingSession,
  startShippingSession,
} from "@/modules/outbound-sessions/services/shipping-session.service";
import type { AssignShippingSessionRequest } from "@/modules/outbound-sessions/types/shipping-session";

type SessionVersionArgs = {
  sessionId: number;
  version?: number | null;
};

function useInvalidateShipping(queryClient: ReturnType<typeof useQueryClient>) {
  const keys = outboundMutationInvalidationKeys();
  return (sessionId?: number) => {
    void queryClient.invalidateQueries({ queryKey: keys.shipping });
    void queryClient.invalidateQueries({ queryKey: keys.picking });
    if (sessionId) {
      void queryClient.invalidateQueries({
        queryKey: outboundQueryKeys.shippingSession(sessionId),
      });
    }
  };
}

export function useApproveShippingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateShipping(queryClient);
  return useMutation({
    mutationFn: ({ sessionId, version }: SessionVersionArgs) =>
      approveShippingSession(sessionId, version),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useCancelShippingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateShipping(queryClient);
  return useMutation({
    mutationFn: ({ sessionId, version }: SessionVersionArgs) =>
      cancelShippingSession(sessionId, version),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useAssignShippingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateShipping(queryClient);
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: number;
      payload: AssignShippingSessionRequest;
    }) => assignShippingSession(sessionId, payload),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useStartShippingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateShipping(queryClient);
  return useMutation({
    mutationFn: ({ sessionId, version }: SessionVersionArgs) =>
      startShippingSession(sessionId, version),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useCompleteShippingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateShipping(queryClient);
  return useMutation({
    mutationFn: ({ sessionId, version }: SessionVersionArgs) =>
      completeShippingSession(sessionId, version),
    onSuccess: (data) => invalidate(data.id),
  });
}
