"use client";

import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useMemo } from "react";

export const TIRE_RACK_GLB_URL = "/models/tire_rack.glb";

export type TireRackModelProps = ThreeElements["group"] & {
  /** When true, loads a cloned scene (use if you mount multiple models). */
  clone?: boolean;
};

export function TireRackModel({
  clone: shouldClone = false,
  ...groupProps
}: TireRackModelProps) {
  const { scene } = useGLTF(TIRE_RACK_GLB_URL);
  const object = useMemo(
    () => (shouldClone ? scene.clone() : scene),
    [scene, shouldClone]
  );
  return <primitive object={object} {...groupProps} />;
}

useGLTF.preload(TIRE_RACK_GLB_URL);
