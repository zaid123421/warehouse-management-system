import { useQuery } from "@tanstack/react-query";
import TokenService from "@/infrastructure/auth/token-service";
import { getWarehouseStaffList } from "@/modules/employees/services/warehouse-staff.service";
import type { WarehouseStaffAssignment } from "@/modules/employees/types/warehouse-staff";

export const warehouseStaffListQueryKey = ["warehouse-staff", "list"] as const;

export function useWarehouseStaff(options?: { enabled?: boolean }) {
  const enabled = (options?.enabled ?? true) && Boolean(TokenService.getAccessToken());

  return useQuery({
    queryKey: warehouseStaffListQueryKey,
    queryFn: (): Promise<WarehouseStaffAssignment[]> => getWarehouseStaffList(),
    enabled,
    staleTime: 60_000,
  });
}
