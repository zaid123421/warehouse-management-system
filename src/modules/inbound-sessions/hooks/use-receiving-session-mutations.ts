import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inboundMutationInvalidationKeys,
  inboundQueryKeys,
} from "@/modules/inbound-sessions/hooks/query-keys";
import {
  approveReceivingSession,
  assignReceivingSession,
  completeReceivingSession,
  createReceivingSession,
  rejectReceivingSession,
  startReceivingSession,
} from "@/modules/inbound-sessions/services/receiving-session.service";
import type {
  AssignReceivingSessionRequest,
  CreateReceivingSessionRequest,
} from "@/modules/inbound-sessions/types/receiving-session";

function useInvalidateReceiving(queryClient: ReturnType<typeof useQueryClient>) {
  const keys = inboundMutationInvalidationKeys();
  return (sessionId?: number) => {
    void queryClient.invalidateQueries({ queryKey: keys.receiving });
    void queryClient.invalidateQueries({ queryKey: keys.putaway });
    void queryClient.invalidateQueries({ queryKey: keys.requests });
    void queryClient.invalidateQueries({ queryKey: keys.dashboard });
    if (sessionId) {
      void queryClient.invalidateQueries({
        queryKey: inboundQueryKeys.receivingSession(sessionId),
      });
    }
  };
}

export function useCreateReceivingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReceiving(queryClient);
  return useMutation({
    mutationFn: (payload: CreateReceivingSessionRequest) => createReceivingSession(payload),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useApproveReceivingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReceiving(queryClient);
  return useMutation({
    mutationFn: (sessionId: number) => approveReceivingSession(sessionId),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useRejectReceivingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReceiving(queryClient);
  return useMutation({
    mutationFn: (sessionId: number) => rejectReceivingSession(sessionId),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useAssignReceivingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReceiving(queryClient);
  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: number;
      payload: AssignReceivingSessionRequest;
    }) => assignReceivingSession(sessionId, payload),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useStartReceivingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReceiving(queryClient);
  return useMutation({
    mutationFn: (sessionId: number) => startReceivingSession(sessionId),
    onSuccess: (data) => invalidate(data.id),
  });
}

export function useCompleteReceivingSession() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateReceiving(queryClient);
  return useMutation({
    mutationFn: (sessionId: number) => completeReceivingSession(sessionId),
    onSuccess: (data) => invalidate(data.id),
  });
}
