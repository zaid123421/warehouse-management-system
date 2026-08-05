import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  outboundMutationInvalidationKeys,
  outboundQueryKeys,
} from "@/modules/outbound-sessions/hooks/query-keys";
import {
  confirmOutboundTruckPlan,
  createShippingSessionFromTruck,
  deleteOutboundTruck,
} from "@/modules/outbound-sessions/services/outbound-truck.service";
import type { ConfirmOutboundTruckPlanRequest } from "@/modules/outbound-sessions/types/outbound-truck";

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

export function useConfirmOutboundTruckPlan() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: (payload: ConfirmOutboundTruckPlanRequest) =>
      confirmOutboundTruckPlan(payload),
    onSuccess: invalidate,
  });
}

export function useDeleteOutboundTruck() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTruckMutations(queryClient);
  return useMutation({
    mutationFn: ({
      truckId,
      version,
    }: {
      truckId: number;
      version?: number | null;
    }) => deleteOutboundTruck(truckId, version),
    onSuccess: invalidate,
  });
}

export function useCreateShippingFromTruck() {
  const queryClient = useQueryClient();
  const keys = outboundMutationInvalidationKeys();
  return useMutation({
    mutationFn: ({
      truckId,
      version,
    }: {
      truckId: number;
      version?: number | null;
    }) => createShippingSessionFromTruck(truckId, version),
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
