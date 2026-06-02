"use client";

import { useRef, type RefObject } from "react";

/** مرجع للحاوية ذات التمرير — يمكن لاحقاً ربطه بكشف شريط التمرير للأنماط */
export function useScrollbarDetection(): RefObject<HTMLDivElement | null> {
  return useRef<HTMLDivElement>(null);
}
