export const outboundQueryKeys = {
  all: ["outbound-sessions"] as const,
  schedulingBoard: () => [...outboundQueryKeys.all, "scheduling-board"] as const,
  schedulingCell: (cellId: number) =>
    [...outboundQueryKeys.all, "scheduling-cell", cellId] as const,
  pickingSessions: () => [...outboundQueryKeys.all, "picking-sessions"] as const,
  pickingSession: (sessionId: number) =>
    [...outboundQueryKeys.all, "picking-session", sessionId] as const,
  shippingSessions: () => [...outboundQueryKeys.all, "shipping-sessions"] as const,
  shippingSession: (sessionId: number) =>
    [...outboundQueryKeys.all, "shipping-session", sessionId] as const,
  planningPool: (schedulingCellId?: number) =>
    [...outboundQueryKeys.all, "planning-pool", schedulingCellId ?? "all"] as const,
  planningTrucks: (filter?: { serviceDate?: string; deliveryDay?: string }) =>
    [
      ...outboundQueryKeys.all,
      "planning-trucks",
      filter?.serviceDate ?? "all",
      filter?.deliveryDay ?? "all",
    ] as const,
  outboundTruck: (truckId: number) =>
    [...outboundQueryKeys.all, "outbound-truck", truckId] as const,
  readyToShipTrucks: () => [...outboundQueryKeys.all, "ready-to-ship"] as const,
};

export function outboundMutationInvalidationKeys() {
  return {
    scheduling: outboundQueryKeys.schedulingBoard(),
    picking: outboundQueryKeys.pickingSessions(),
    shipping: outboundQueryKeys.shippingSessions(),
    planningPool: outboundQueryKeys.planningPool(),
    planningTrucks: [...outboundQueryKeys.all, "planning-trucks"] as const,
    readyToShip: outboundQueryKeys.readyToShipTrucks(),
  };
}
