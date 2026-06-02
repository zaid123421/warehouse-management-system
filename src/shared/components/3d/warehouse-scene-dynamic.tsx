"use client";

import dynamic from "next/dynamic";
import type { WarehouseSceneProps } from "@/shared/components/3d/warehouse-scene";

export const WarehouseSceneDynamic = dynamic<WarehouseSceneProps>(
  () =>
    import("@/shared/components/3d/warehouse-scene").then((m) => m.WarehouseScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(520px,65vh)] min-h-[300px] w-full items-center justify-center rounded-lg border border-border/60 bg-muted/20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    ),
  }
);
