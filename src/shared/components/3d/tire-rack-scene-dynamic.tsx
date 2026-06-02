"use client";

import dynamic from "next/dynamic";
import type { TireRackSceneProps } from "@/shared/components/3d/tire-rack-scene";

export const TireRackSceneDynamic = dynamic<TireRackSceneProps>(
  () =>
    import("@/shared/components/3d/tire-rack-scene").then((m) => m.TireRackScene),
  { ssr: false }
);
