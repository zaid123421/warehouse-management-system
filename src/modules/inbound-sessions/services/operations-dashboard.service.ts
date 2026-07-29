import api from "@/lib/api";
import { ENDPOINTS } from "@/services/endpoints";
import { toInboundError } from "@/modules/inbound-sessions/lib/inbound-error";
import { normalizeOperationsDashboard } from "@/modules/inbound-sessions/lib/operations-dashboard-dto";
import type { OperationsDashboard } from "@/modules/inbound-sessions/types/operations-dashboard";

export async function getOperationsDashboard(): Promise<OperationsDashboard> {
  try {
    const { data } = await api.get<unknown>(ENDPOINTS.WMS_OPERATIONS.DASHBOARD);
    return normalizeOperationsDashboard(data);
  } catch (err: unknown) {
    toInboundError(err);
  }
}
