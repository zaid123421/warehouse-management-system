export const inboundQueryKeys = {
  all: ["inbound-sessions"] as const,
  schedulingBoard: () => [...inboundQueryKeys.all, "scheduling-board"] as const,
  schedulingCell: (cellId: number) =>
    [...inboundQueryKeys.all, "scheduling-cell", cellId] as const,
  inboundRequests: (status?: string) =>
    [...inboundQueryKeys.all, "inbound-requests", status ?? "default"] as const,
  inboundRequest: (requestId: number) =>
    [...inboundQueryKeys.all, "inbound-request", requestId] as const,
  receivingSessions: () => [...inboundQueryKeys.all, "receiving-sessions"] as const,
  receivingSession: (sessionId: number) =>
    [...inboundQueryKeys.all, "receiving-session", sessionId] as const,
  putawaySessions: () => [...inboundQueryKeys.all, "putaway-sessions"] as const,
  putawaySession: (sessionId: number) =>
    [...inboundQueryKeys.all, "putaway-session", sessionId] as const,
  operationsDashboard: () => [...inboundQueryKeys.all, "operations-dashboard"] as const,
};

export function inboundMutationInvalidationKeys() {
  return {
    scheduling: inboundQueryKeys.schedulingBoard(),
    requests: inboundQueryKeys.inboundRequests(),
    receiving: inboundQueryKeys.receivingSessions(),
    putaway: inboundQueryKeys.putawaySessions(),
    dashboard: inboundQueryKeys.operationsDashboard(),
  };
}
