import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateWarehouseStaffStatus } from "@/modules/employees/services/warehouse-staff.service";
import type { UpdateStaffStatusRequest } from "@/modules/employees/types/warehouse-staff";

export type UpdateStaffStatusInput = {
  userId: number;
  payload: UpdateStaffStatusRequest;
};

export function useUpdateStaffStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: UpdateStaffStatusInput) =>
      updateWarehouseStaffStatus(userId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["warehouse-staff"] });
    },
  });
}
