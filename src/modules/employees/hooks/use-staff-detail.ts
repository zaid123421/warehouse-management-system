import { useQuery } from "@tanstack/react-query";
import { getWarehouseStaffById } from "@/modules/employees/services/warehouse-staff.service";
import type { WarehouseStaffAssignment } from "@/modules/employees/types/warehouse-staff";

export const staffDetailQueryKey = (userId: number) =>
  ["warehouse-staff", "detail", userId] as const;

export function useStaffDetail(userId: number | null, enabled = true) {
  return useQuery({
    queryKey: staffDetailQueryKey(userId ?? 0),
    queryFn: (): Promise<WarehouseStaffAssignment> => {
      if (userId == null) throw new Error("Missing user id");
      return getWarehouseStaffById(userId);
    },
    enabled: enabled && userId != null && userId > 0,
    staleTime: 30_000,
  });
}
