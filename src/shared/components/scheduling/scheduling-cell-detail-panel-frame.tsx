"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SchedulingCellDetailPanelFrameProps = {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  closeLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function SchedulingCellDetailPanelFrame({
  title,
  subtitle,
  onClose,
  closeLabel = "Close",
  children,
  footer,
  className,
}: SchedulingCellDetailPanelFrameProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-[var(--color-surface-light-container)] bg-card dark:border-[var(--color-surface-container-high)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-surface-light-container)] px-4 py-3 dark:border-[var(--color-surface-container-high)]">
        <div className="min-w-0">
          <h3 className="text-label-lg font-semibold text-foreground">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-body-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>
      <div className="space-y-4 px-4 py-4">{children}</div>
      {footer ? (
        <div className="space-y-3 border-t border-[var(--color-surface-light-container)] px-4 py-4 dark:border-[var(--color-surface-container-high)]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
