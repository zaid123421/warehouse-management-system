import { useMutation, useQueryClient } from "@tanstack/react-query";
import { initiateWarehouse } from "@/modules/warehouse-structure/services/my-warehouse.service";
import { myWarehouseQueryKey } from "@/modules/warehouse-structure/hooks/use-my-warehouse";
import type { InitiateWarehouseRequest } from "@/modules/warehouse-structure/types/my-warehouse";

export function useInitiateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InitiateWarehouseRequest) => initiateWarehouse(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: myWarehouseQueryKey });
    },
  });
}
