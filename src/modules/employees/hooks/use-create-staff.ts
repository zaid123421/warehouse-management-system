import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createWarehouseStaff,
  getWarehouseStaffList,
  updateWarehouseStaffStatus,
} from "@/modules/employees/services/warehouse-staff.service";
import type { CreateStaffRequest } from "@/modules/employees/types/warehouse-staff";
import { warehouseStaffListQueryKey } from "@/modules/employees/hooks/use-warehouse-staff";

export type CreateStaffInput = CreateStaffRequest & { active: boolean };

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ active, ...payload }: CreateStaffInput) => {
      await createWarehouseStaff(payload);
      if (!active) {
        const list = await getWarehouseStaffList();
        const created = list.find(
          (row) => row.user.email.toLowerCase() === payload.email.toLowerCase(),
        );
        if (created) {
          await updateWarehouseStaffStatus(created.user.id, { active: false });
        }
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: warehouseStaffListQueryKey });
    },
  });
}
