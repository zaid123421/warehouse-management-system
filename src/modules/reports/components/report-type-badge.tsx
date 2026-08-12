"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReportKind } from "@/modules/reports/types/report";

type ReportTypeBadgeProps = {
  kind: ReportKind;
  className?: string;
  badgeClassName: string;
};

export function ReportTypeBadge({ kind, className, badgeClassName }: ReportTypeBadgeProps) {
  const t = useTranslations("reports");
  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide",
        badgeClassName,
        className,
      )}
    >
      {t(`kinds.${kind}.badge`)}
    </Badge>
  );
}
