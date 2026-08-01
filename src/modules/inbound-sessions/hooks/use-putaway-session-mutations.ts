import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inboundMutationInvalidationKeys,
  inboundQueryKeys,
} from "@/modules/inbound-sessions/hooks/query-keys";
import {
  approvePutawaySession,
  assignPutawaySession,
  startPutawaySession,
} from "@/modules/inbound-sessions/services/putaway-session.service";
import type { AssignPutawaySessionRequest } from "@/modules/inbound-sessions/types/putaway-session";

function useInvalidatePutaway(queryClient: ReturnType<typeof useQueryClient>) {
  const keys = inboundMutationInvalidationKeys();
  return (sessionId?: number) => {
    void queryClient.invalidateQueries({ queryKey: keys.putaway });
    void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    if (sessionId) {
      void queryClient.invalidateQueries({
        queryKey: inboundQueryKeys.putawaySession(sessionId),
      });
    }
  };
}

type SessionVersionArgs = {
  sessionId: number;
  version?: number | null;
};

export function useApprovePutawaySession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePutaway(queryClient);
  return useMutation({
    mutationFn: ({ sessionId, version }: SessionVersionArgs) =>
      approvePutawaySession(sessionId, version),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useAssignPutawaySession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePutaway(queryClient);
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: number;
      payload: AssignPutawaySessionRequest;
    }) => assignPutawaySession(sessionId, payload),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useStartPutawaySession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePutaway(queryClient);
  return useMutation({
    mutationFn: ({ sessionId, version }: SessionVersionArgs) =>
      startPutawaySession(sessionId, version),
    onSuccess: (data) => invalidate(data.id),
  });
}
