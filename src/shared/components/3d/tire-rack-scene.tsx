"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  TireRackModel,
  type TireRackModelProps,
} from "@/shared/components/3d/tire-rack-model";

export type TireRackOrbitProps = {
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

export type TireRackSceneProps = {
  className?: string;
  canvasClassName?: string;
  /** Initial camera position */
  cameraPosition?: [number, number, number];
  fov?: number;
  ambientIntensity?: number;
  directionalPosition?: [number, number, number];
  directionalIntensity?: number;
  modelProps?: TireRackModelProps;
  orbitProps?: TireRackOrbitProps;
  fallback?: ReactNode;
};

function SceneContent({
  cameraPosition,
  fov,
  ambientIntensity,
  directionalPosition,
  directionalIntensity,
  modelProps,
  orbitProps,
}: Omit<TireRackSceneProps, "className" | "canvasClassName" | "fallback">) {
  const {
    enableZoom = true,
    enablePan = true,
    enableRotate = true,
    autoRotate = false,
    autoRotateSpeed = 0.5,
    minDistance = 1.5,
    maxDistance = 20,
    minPolarAngle = 0,
    maxPolarAngle = Math.PI,
    target = [0, 0, 0],
  } = orbitProps ?? {};

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={cameraPosition ?? [4, 2.5, 4]}
        fov={fov ?? 45}
      />
      <ambientLight intensity={ambientIntensity ?? 0.55} />
      <directionalLight
        castShadow
        position={directionalPosition ?? [6, 10, 4]}
        intensity={directionalIntensity ?? 1.1}
      />
      <TireRackModel {...(modelProps ?? {})} />
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

export function TireRackScene({
  className,
  canvasClassName,
  cameraPosition,
  fov,
  ambientIntensity,
  directionalPosition,
  directionalIntensity,
  modelProps,
  orbitProps,
  fallback,
}: TireRackSceneProps) {
  return (
    <div
      className={cn(
        "relative h-[min(400px,60vh)] w-full min-h-[280px] overflow-hidden rounded-lg border border-border/60 bg-muted/20",
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
            modelProps={modelProps}
            orbitProps={orbitProps}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
