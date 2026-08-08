export const inboundQueryKeys = {
  all: ["inbound-sessions"] as const,
  /** Omit weekStart to get the prefix that invalidates every cached week. */
  schedulingBoard: (weekStart?: string) =>
    weekStart
      ? ([...inboundQueryKeys.all, "scheduling-board", weekStart] as const)
      : ([...inboundQueryKeys.all, "scheduling-board"] as const),
  schedulingCell: (cellId: number) =>
    [...inboundQueryKeys.all, "scheduling-cell", cellId] as const,
  receivingSessions: () => [...inboundQueryKeys.all, "receiving-sessions"] as const,
  receivingSession: (sessionId: number) =>
    [...inboundQueryKeys.all, "receiving-session", sessionId] as const,
  putawaySessions: () => [...inboundQueryKeys.all, "putaway-sessions"] as const,
  putawaySession: (sessionId: number) =>
    [...inboundQueryKeys.all, "putaway-session", sessionId] as const,
  planningPool: (schedulingCellId?: number) =>
    [...inboundQueryKeys.all, "planning-pool", schedulingCellId ?? "all"] as const,
  planningTrucks: (filter?: {
    schedulingCellId?: number;
    serviceDate?: string;
    receivingDay?: string;
  }) =>
    [
      ...inboundQueryKeys.all,
      "planning-trucks",
      filter?.schedulingCellId ?? "all",
      filter?.serviceDate ?? "all",
      filter?.receivingDay ?? "all",
    ] as const,
  inboundTruck: (truckId: number) =>
    [...inboundQueryKeys.all, "inbound-truck", truckId] as const,
  transitTrucks: () => [...inboundQueryKeys.all, "transit-trucks"] as const,
  operationsDashboard: () => [...inboundQueryKeys.all, "operations-dashboard"] as const,
};

export function inboundMutationInvalidationKeys() {
  return {
    scheduling: inboundQueryKeys.schedulingBoard(),
    receiving: inboundQueryKeys.receivingSessions(),
    putaway: inboundQueryKeys.putawaySessions(),
    planningPool: inboundQueryKeys.planningPool(),
    planningTrucks: [...inboundQueryKeys.all, "planning-trucks"] as const,
    transit: inboundQueryKeys.transitTrucks(),
    dashboard: inboundQueryKeys.operationsDashboard(),
  };
}
