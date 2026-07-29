"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusLabel, getStatusVariant } from "@/modules/outbound-sessions/lib/status-utils";

type SessionStatusBadgeProps = {
  status: string;
  className?: string;
};

const VARIANT_CLASS: Record<
  ReturnType<typeof getStatusVariant>,
  string
> = {
  default: "bg-primary/10 text-primary hover:bg-primary/10",
  success: "bg-emerald-600/15 text-emerald-700 hover:bg-emerald-600/15 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400",
  danger: "bg-destructive/15 text-destructive hover:bg-destructive/15",
  muted: "bg-muted text-muted-foreground hover:bg-muted",
};

export function OutboundSessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  const t = useTranslations("outboundSessions.statuses");
  const variant = getStatusVariant(status);
  const label = getStatusLabel((key) => t(key as never), status);
  return (
    <Badge
      className={cn(
        "rounded-full border-0 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {label}
    </Badge>
  );
}
