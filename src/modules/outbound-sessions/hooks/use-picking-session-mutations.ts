import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  outboundMutationInvalidationKeys,
  outboundQueryKeys,
} from "@/modules/outbound-sessions/hooks/query-keys";
import {
  approvePickingSession,
  assignPickingSession,
  cancelPickingSession,
  completePickingSession,
  dispatchPickingSession,
  startPickingSession,
} from "@/modules/outbound-sessions/services/picking-session.service";
import type { AssignPickingSessionRequest } from "@/modules/outbound-sessions/types/picking-session";

function useInvalidatePicking(queryClient: ReturnType<typeof useQueryClient>) {
  const keys = outboundMutationInvalidationKeys();
  return (sessionId?: number) => {
    void queryClient.invalidateQueries({ queryKey: keys.picking });
    void queryClient.invalidateQueries({ queryKey: keys.scheduling });
    if (sessionId) {
      void queryClient.invalidateQueries({
        queryKey: outboundQueryKeys.pickingSession(sessionId),
      });
    }
  };
}

export function useApprovePickingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePicking(queryClient);
  return useMutation({
    mutationFn: (sessionId: number) => approvePickingSession(sessionId),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useCancelPickingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePicking(queryClient);
  return useMutation({
    mutationFn: (sessionId: number) => cancelPickingSession(sessionId),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useAssignPickingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePicking(queryClient);
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: number;
      payload: AssignPickingSessionRequest;
    }) => assignPickingSession(sessionId, payload),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useStartPickingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePicking(queryClient);
  return useMutation({
    mutationFn: (sessionId: number) => startPickingSession(sessionId),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useCompletePickingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePicking(queryClient);
  return useMutation({
    mutationFn: (sessionId: number) => completePickingSession(sessionId),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useDispatchPickingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePicking(queryClient);
  return useMutation({
    mutationFn: (sessionId: number) => dispatchPickingSession(sessionId),
    onSuccess: (data) => invalidate(data.id),
  });
}
