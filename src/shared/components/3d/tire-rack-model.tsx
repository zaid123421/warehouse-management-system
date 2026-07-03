"use client";

import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

export type TireRackModelProps = ThreeElements["group"] & {
  color?: string;
  shelfLevels?: number;
  tiresPerShelf?: number;
};

const RACK_WIDTH = 1.6;
const RACK_DEPTH = 0.75;
const POST_RADIUS = 0.04;
const SHELF_THICKNESS = 0.05;
const TIRE_RADIUS = 0.22;
const TIRE_TUBE = 0.09;

function createRackMaterials(color: string) {
  const frame = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.35,
    roughness: 0.55,
  });
  const tire = new THREE.MeshStandardMaterial({
    color: "#1e293b",
    metalness: 0.1,
    roughness: 0.85,
  });
  return { frame, tire };
}

export function TireRackModel({
  color = "#64748b",
  shelfLevels = 4,
  tiresPerShelf = 3,
  ...groupProps
}: TireRackModelProps) {
  const levels = Math.max(1, shelfLevels);
  const tires = Math.max(1, Math.min(tiresPerShelf, 4));
  const rackHeight = 0.35 + levels * 0.55;

  const { frameMaterial, tireMaterial, postGeo, shelfGeo, tireGeo } = useMemo(() => {
    const materials = createRackMaterials(color);
    return {
      frameMaterial: materials.frame,
      tireMaterial: materials.tire,
      postGeo: new THREE.CylinderGeometry(POST_RADIUS, POST_RADIUS, rackHeight, 8),
      shelfGeo: new THREE.BoxGeometry(RACK_WIDTH, SHELF_THICKNESS, RACK_DEPTH),
      tireGeo: new THREE.TorusGeometry(TIRE_RADIUS, TIRE_TUBE, 10, 24),
    };
  }, [color, rackHeight]);

  const halfW = RACK_WIDTH / 2 - POST_RADIUS;
  const halfD = RACK_DEPTH / 2 - POST_RADIUS;
  const postY = rackHeight / 2;

  const postPositions: [number, number, number][] = [
    [-halfW, postY, -halfD],
    [halfW, postY, -halfD],
    [-halfW, postY, halfD],
    [halfW, postY, halfD],
  ];

  const shelfYs = Array.from({ length: levels }, (_, i) => 0.2 + i * 0.55);
  const tireSpacing = RACK_WIDTH / (tires + 1);

  return (
    <group {...groupProps}>
      {postPositions.map((pos, i) => (
        <mesh key={`post-${i}`} position={pos} material={frameMaterial} geometry={postGeo} castShadow />
      ))}
      {shelfYs.map((y, i) => (
        <mesh
          key={`shelf-${i}`}
          position={[0, y, 0]}
          material={frameMaterial}
          geometry={shelfGeo}
          castShadow
          receiveShadow
        />
      ))}
      {shelfYs.flatMap((y, shelfIndex) =>
        Array.from({ length: tires }, (_, tireIndex) => {
          const x = -RACK_WIDTH / 2 + tireSpacing * (tireIndex + 1);
          return (
            <mesh
              key={`tire-${shelfIndex}-${tireIndex}`}
              position={[x, y + TIRE_RADIUS * 0.55, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              material={tireMaterial}
              geometry={tireGeo}
              castShadow
            />
          );
        })
      )}
    </group>
  );
}
