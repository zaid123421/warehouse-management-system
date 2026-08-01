import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  outboundMutationInvalidationKeys,
  outboundQueryKeys,
} from "@/modules/outbound-sessions/hooks/query-keys";
import {
  approveOutboundTruck,
  assignOutboundRequestToTruck,
  createOutboundTruck,
  createShippingSessionFromTruck,
  deleteOutboundTruck,
  unassignOutboundRequestFromTruck,
} from "@/modules/outbound-sessions/services/outbound-truck.service";
import type { CreateOutboundTruckRequest } from "@/modules/outbound-sessions/types/outbound-truck";

function useInvalidateTruckMutations(queryClient: ReturnType<typeof useQueryClient>) {
  const keys = outboundMutationInvalidationKeys();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: [...outboundQueryKeys.all, "planning-pool"],
    });
    void queryClient.invalidateQueries({ queryKey: keys.planningTrucks });
    void queryClient.invalidateQueries({ queryKey: keys.readyToShip });
    void queryClient.invalidateQueries({ queryKey: keys.scheduling });
    void queryClient.invalidateQueries({ queryKey: keys.picking });
    void queryClient.invalidateQueries({ queryKey: keys.shipping });
  };
}

export function useCreateOutboundTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: (payload: CreateOutboundTruckRequest) => createOutboundTruck(payload),
    onSuccess: invalidate,
  });
}

export function useAssignOutboundRequestToTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: ({
      truckId,
      outboundRequestId,
    }: {
      truckId: number;
      outboundRequestId: number;
    }) => assignOutboundRequestToTruck(truckId, outboundRequestId),
    onSuccess: invalidate,
  });
}

export function useUnassignOutboundRequestFromTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: ({
      truckId,
      outboundRequestId,
    }: {
      truckId: number;
      outboundRequestId: number;
    }) => unassignOutboundRequestFromTruck(truckId, outboundRequestId),
    onSuccess: invalidate,
  });
}

export function useApproveOutboundTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: (truckId: number) => approveOutboundTruck(truckId),
    onSuccess: invalidate,
  });
}

export function useDeleteOutboundTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: (truckId: number) => deleteOutboundTruck(truckId),
    onSuccess: invalidate,
  });
}

export function useCreateShippingFromTruck() {
  const queryClient = useQueryClient();
  const keys = outboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: (truckId: number) => createShippingSessionFromTruck(truckId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: keys.shipping });
      void queryClient.invalidateQueries({ queryKey: keys.readyToShip });
      void queryClient.invalidateQueries({ queryKey: keys.planningTrucks });
      void queryClient.invalidateQueries({
        queryKey: outboundQueryKeys.shippingSession(data.id),
      });
    },
  });
}
