"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const KNOWN_STATUSES = new Set([
  "EMPTY",
  "OCCUPIED",
  "RESERVED_INBOUND",
  "RESERVED_OUTBOUND",
  "RESERVED",
  "FULL",
]);

export type PositionStatusBadgeProps = {
  status: string;
  className?: string;
};

export function PositionStatusBadge({ status, className }: PositionStatusBadgeProps) {
  const t = useTranslations("warehouseStructure.viz.positionStatus");
  const normalized = status.trim().toUpperCase();
  const label = KNOWN_STATUSES.has(normalized)
    ? t(normalized as "EMPTY" | "OCCUPIED" | "RESERVED_INBOUND" | "RESERVED_OUTBOUND" | "RESERVED" | "FULL")
    : status || "—";

  const tone =
    normalized === "EMPTY"
      ? "bg-muted text-muted-foreground"
      : normalized === "OCCUPIED"
        ? "bg-primary-dark text-white"
        : normalized.includes("RESERVED") || normalized === "FULL"
          ? "bg-warning-dark/20 text-warning-dark"
          : "bg-secondary-main/20 text-secondary-onSurface";

  return (
    <Badge
      className={cn(
        "rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        tone,
        className,
      )}
    >
      {label}
    </Badge>
  );
}
