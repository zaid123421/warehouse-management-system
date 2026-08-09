"use client";

import { useMemo } from "react";
import { useWarehouseStaff } from "@/modules/employees/hooks/use-warehouse-staff";
import { staffFullName } from "@/modules/employees/lib/warehouse-staff-dto";

/** Map staff user ids → display names from the warehouse staff API. */
export function useStaffNameMap(enabled = true) {
  const { data: staff = [], isPending } = useWarehouseStaff({ enabled });

  const nameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const row of staff) {
      map.set(row.user.id, staffFullName(row));
    }
    return map;
  }, [staff]);

  function resolveNames(userIds?: number[] | null): string[] {
    if (!userIds?.length) return [];
    return userIds.map((id) => nameById.get(id) ?? `#${id}`);
  }

  return { nameById, resolveNames, isPending, staff };
}
