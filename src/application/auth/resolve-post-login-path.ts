import { ROUTES } from "@/constants/routes";
import type { Role } from "@/shared/config/roles";
import { getMyWarehouse } from "@/modules/warehouse-structure/services/my-warehouse.service";

const ROLES_WITH_WAREHOUSE_STRUCTURE: Role[] = ["admin", "supplier"];

/**
 * After login: send warehouse managers to structure setup when not initialized.
 * Falls back to dashboard on error or when the role cannot access that page.
 */
export async function resolvePostLoginPath(role: Role): Promise<string> {
  if (!ROLES_WITH_WAREHOUSE_STRUCTURE.includes(role)) {
    return ROUTES.DASHBOARD.ROOT;
  }

  try {
    const warehouse = await getMyWarehouse();
    if (!warehouse.initialized) {
      return ROUTES.DASHBOARD.WAREHOUSE_STRUCTURE;
    }
  } catch {
    /* ignore — still land on dashboard */
  }

  return ROUTES.DASHBOARD.ROOT;
}
