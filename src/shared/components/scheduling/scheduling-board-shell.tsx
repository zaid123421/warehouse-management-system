"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type SchedulingBoardShellProps = {
  hint?: ReactNode;
  toolbar?: ReactNode;
  kpiRow?: ReactNode;
  grid: ReactNode;
  detailPanel?: ReactNode;
  className?: string;
};

export function SchedulingBoardShell({
  hint,
  toolbar,
  kpiRow,
  grid,
  detailPanel,
  className,
}: SchedulingBoardShellProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {hint ? (
        <div className="flex gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-body-md text-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">{hint}</div>
        </div>
      ) : null}

      {toolbar ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          {toolbar}
        </div>
      ) : null}

      {kpiRow}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">{grid}</div>
        {detailPanel ? (
          <aside className="w-full shrink-0 xl:w-[28rem]">{detailPanel}</aside>
        ) : null}
      </div>
    </div>
  );
}
