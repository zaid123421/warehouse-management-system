import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inboundMutationInvalidationKeys,
  inboundQueryKeys,
} from "@/modules/inbound-sessions/hooks/query-keys";
import {
  approveInboundTruck,
  assignRequestToTruck,
  createInboundTruck,
  createReceivingSessionFromTruck,
  unassignRequestFromTruck,
} from "@/modules/inbound-sessions/services/inbound-truck.service";
import type { CreateInboundTruckRequest } from "@/modules/inbound-sessions/types/inbound-truck";

function useInvalidateTruckMutations(queryClient: ReturnType<typeof useQueryClient>) {
  const keys = inboundMutationInvalidationKeys();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: [...inboundQueryKeys.all, "planning-pool"],
    });
    void queryClient.invalidateQueries({ queryKey: keys.planningTrucks });
    void queryClient.invalidateQueries({ queryKey: keys.transit });
    void queryClient.invalidateQueries({ queryKey: keys.scheduling });
    void queryClient.invalidateQueries({ queryKey: keys.dashboard });
  };
}

export function useCreateInboundTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: (payload: CreateInboundTruckRequest) => createInboundTruck(payload),
    onSuccess: invalidate,
  });
}

export function useAssignRequestToTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: ({
      truckId,
      inboundRequestId,
      version,
    }: {
      truckId: number;
      inboundRequestId: number;
      version?: number | null;
    }) => assignRequestToTruck(truckId, inboundRequestId, version),
    onSuccess: invalidate,
  });
}

export function useUnassignRequestFromTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: ({
      truckId,
      inboundRequestId,
      version,
    }: {
      truckId: number;
      inboundRequestId: number;
      version?: number | null;
    }) => unassignRequestFromTruck(truckId, inboundRequestId, version),
    onSuccess: invalidate,
  });
}

export function useApproveInboundTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: ({
      truckId,
      version,
    }: {
      truckId: number;
      version?: number | null;
    }) => approveInboundTruck(truckId, version),
    onSuccess: invalidate,
  });
}

export function useCreateReceivingFromTruck() {
  const queryClient = useQueryClient();
  const keys = inboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: ({
      truckId,
      version,
    }: {
      truckId: number;
      version?: number | null;
    }) => createReceivingSessionFromTruck(truckId, version),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: keys.receiving });
      void queryClient.invalidateQueries({ queryKey: keys.transit });
      void queryClient.invalidateQueries({ queryKey: keys.dashboard });
      void queryClient.invalidateQueries({
        queryKey: inboundQueryKeys.receivingSession(data.id),
      });
    },
  });
}
