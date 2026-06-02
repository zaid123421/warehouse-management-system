"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import {
  getAllRackSlots,
  getWarehouseZoneById,
} from "@/shared/config/warehouse-zones";
import { TIRE_RACK_GLB_URL } from "@/shared/components/3d/tire-rack-model";

function applyZoneTint(root: THREE.Object3D, hexColor: string) {
  const tint = new THREE.Color(hexColor);
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const orig = child.material;
    const list = Array.isArray(orig) ? orig : [orig];
    const next = list.map((m) => {
      if (
        m instanceof THREE.MeshStandardMaterial ||
        m instanceof THREE.MeshPhysicalMaterial ||
        m instanceof THREE.MeshLambertMaterial ||
        m instanceof THREE.MeshBasicMaterial
      ) {
        const copy = m.clone();
        copy.color.copy(tint);
        return copy;
      }
      return m.clone();
    });
    child.material = Array.isArray(orig) ? next : next[0]!;
  });
}

export function WarehouseRackLayout() {
  const { scene } = useGLTF(TIRE_RACK_GLB_URL);

  const racks = useMemo(() => {
    const layout = getAllRackSlots();
    const out: {
      key: string;
      object: THREE.Object3D;
      position: [number, number, number];
      rotationY: number;
    }[] = [];
    layout.forEach((slot, index) => {
      const zone = getWarehouseZoneById(slot.zoneId);
      if (!zone) return;
      const cloned = scene.clone(true) as THREE.Object3D;
      applyZoneTint(cloned, zone.colorHex);
      out.push({
        key: `${slot.zoneId}-${index}`,
        object: cloned,
        position: slot.position,
        rotationY: slot.rotationY ?? 0,
      });
    });
    return out;
  }, [scene]);

  return (
    <group>
      {racks.map(({ key, object, position, rotationY }) => (
        <primitive
          key={key}
          object={object}
          position={position}
          rotation={[0, rotationY, 0]}
        />
      ))}
    </group>
  );
}
