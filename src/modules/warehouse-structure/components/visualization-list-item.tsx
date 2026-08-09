"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { vizTypography } from "@/modules/warehouse-structure/lib/viz-typography";

export type VisualizationListItemProps = {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  footer?: ReactNode;
  selected?: boolean;
  emphasis?: boolean;
  onClick?: () => void;
  className?: string;
};

export function VisualizationListItem({
  title,
  subtitle,
  meta,
  footer,
  selected = false,
  emphasis = false,
  onClick,
  className,
}: VisualizationListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 p-3 text-start transition-colors",
        selected
          ? "border-primary-dark bg-primary-container shadow-sm dark:bg-primary-dark/15"
          : "border-[var(--color-surface-light-container)] bg-card hover:border-primary-dark/40 hover:bg-primary-dark/[0.03] dark:border-[var(--color-surface-container-high)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              emphasis ? vizTypography.listTitleEmphasis : vizTypography.listTitleDefault,
              selected && "text-primary-dark",
            )}
          >
            {title}
          </p>
          {subtitle ? <p className={vizTypography.listSubtitle}>{subtitle}</p> : null}
        </div>
        {meta ? <div className="shrink-0">{meta}</div> : null}
        <ChevronRight
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground/70",
            selected && "text-primary-dark",
          )}
          aria-hidden
        />
      </div>
      {footer ? <div className="mt-3 border-t border-[var(--color-surface-light-container)] pt-3 dark:border-[var(--color-surface-container-high)]">{footer}</div> : null}
    </button>
  );
}
