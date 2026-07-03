"use client";

import { useMemo } from "react";
import {
  getAllRackSlots,
  getWarehouseZoneById,
} from "@/shared/config/warehouse-zones";
import { TireRackModel } from "@/shared/components/3d/tire-rack-model";

export function WarehouseRackLayout() {
  const racks = useMemo(() => {
    return getAllRackSlots()
      .map((slot, index) => {
        const zone = getWarehouseZoneById(slot.zoneId);
        if (!zone) return null;
        return {
          key: `${slot.zoneId}-${index}`,
          zone,
          position: slot.position,
          rotationY: slot.rotationY ?? 0,
        };
      })
      .filter((rack): rack is NonNullable<typeof rack> => rack !== null);
  }, []);

  return (
    <group>
      {racks.map(({ key, zone, position, rotationY }) => (
        <TireRackModel
          key={key}
          position={position}
          rotation={[0, rotationY, 0]}
          color={zone.colorHex}
          shelfLevels={zone.shelfLevels}
        />
      ))}
    </group>
  );
}
