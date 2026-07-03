import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWarehouseStaff } from "@/modules/employees/services/warehouse-staff.service";
import type { UpdateStaffRequest } from "@/modules/employees/types/warehouse-staff";
import { staffDetailQueryKey } from "@/modules/employees/hooks/use-staff-detail";

export type UpdateStaffInput = {
  userId: number;
  payload: UpdateStaffRequest;
};

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: UpdateStaffInput) =>
      updateWarehouseStaff(userId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["warehouse-staff"] });
      void queryClient.invalidateQueries({
        queryKey: staffDetailQueryKey(variables.userId),
      });
    },
  });
}
