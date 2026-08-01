"use client";

import { cn } from "@/lib/utils";

type SessionProgressBarProps = {
  value: number;
  className?: string;
  label?: string;
};

export function SessionProgressBar({ value, className, label }: SessionProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-1", className)}>
      {label ? (
        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      ) : null}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary dark:bg-secondary/40">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-in-out",
            clamped === 100 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-primary"
          )}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
