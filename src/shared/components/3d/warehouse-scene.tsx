"use client";

import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WarehouseRackLayout } from "@/shared/components/3d/warehouse-rack-layout";

export type WarehouseOrbitProps = {
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  minDistance?: number;
  maxDistance?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  target?: [number, number, number];
};

export type WarehouseSceneProps = {
  className?: string;
  canvasClassName?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
  ambientIntensity?: number;
  directionalPosition?: [number, number, number];
  directionalIntensity?: number;
  orbitProps?: WarehouseOrbitProps;
  fallback?: ReactNode;
};

function SceneContent({
  cameraPosition,
  fov,
  ambientIntensity,
  directionalPosition,
  directionalIntensity,
  orbitProps,
}: Omit<WarehouseSceneProps, "className" | "canvasClassName" | "fallback">) {
  const {
    enableZoom = true,
    enablePan = true,
    enableRotate = true,
    autoRotate = false,
    autoRotateSpeed = 0.4,
    minDistance = 4,
    maxDistance = 35,
    minPolarAngle = 0.15,
    maxPolarAngle = Math.PI / 2 + 0.2,
    target = [0, 0.6, 0.4],
  } = orbitProps ?? {};

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={cameraPosition ?? [10, 6.5, 11]}
        fov={fov ?? 40}
      />
      <ambientLight intensity={ambientIntensity ?? 0.5} />
      <directionalLight
        castShadow
        position={directionalPosition ?? [8, 14, 6]}
        intensity={directionalIntensity ?? 1.15}
      />
      <WarehouseRackLayout />
      <Grid
        args={[32, 32]}
        position={[0, -0.02, 0]}
        cellSize={0.45}
        cellThickness={0.6}
        cellColor="#64748b"
        sectionSize={2.4}
        sectionThickness={1}
        sectionColor="#94a3b8"
        fadeDistance={36}
        fadeStrength={1}
        infiniteGrid
      />
      <OrbitControls
        makeDefault
        enableZoom={enableZoom}
        enablePan={enablePan}
        enableRotate={enableRotate}
        autoRotate={autoRotate}
        autoRotateSpeed={autoRotateSpeed}
        minDistance={minDistance}
        maxDistance={maxDistance}
        minPolarAngle={minPolarAngle}
        maxPolarAngle={maxPolarAngle}
        target={target}
      />
    </>
  );
}

export function WarehouseScene({
  className,
  canvasClassName,
  cameraPosition,
  fov,
  ambientIntensity,
  directionalPosition,
  directionalIntensity,
  orbitProps,
  fallback,
}: WarehouseSceneProps) {
  return (
    <div
      className={cn(
        "relative h-[min(520px,65vh)] w-full min-h-[300px] overflow-hidden rounded-lg border border-border/60 bg-muted/20",
        className
      )}
    >
      <Suspense
        fallback={
          fallback ?? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          )
        }
      >
        <Canvas
          className={cn("h-full w-full", canvasClassName)}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          shadows
          dpr={[1, 2]}
        >
          <SceneContent
            cameraPosition={cameraPosition}
            fov={fov}
            ambientIntensity={ambientIntensity}
            directionalPosition={directionalPosition}
            directionalIntensity={directionalIntensity}
            orbitProps={orbitProps}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
