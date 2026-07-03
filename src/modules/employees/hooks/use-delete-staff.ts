import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteWarehouseStaff } from "@/modules/employees/services/warehouse-staff.service";

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => deleteWarehouseStaff(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["warehouse-staff"] });
    },
  });
}
