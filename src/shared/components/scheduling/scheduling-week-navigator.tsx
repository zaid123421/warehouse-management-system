"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  addWeeks,
  dateFromIsoCalendarDay,
  isSameLocalDay,
  startOfWeek,
  toIsoDate,
  withUtcCalendarTimeZone,
} from "@/shared/lib/scheduling-week";

type SchedulingWeekNavigatorProps = {
  weekStart: Date;
  weekEnd: Date;
  onWeekStartChange: (weekStart: Date) => void;
  translationNamespace: string;
  className?: string;
};

export function SchedulingWeekNavigator({
  weekStart,
  weekEnd,
  onWeekStartChange,
  translationNamespace,
  className,
}: SchedulingWeekNavigatorProps) {
  const t = useTranslations(translationNamespace);
  const format = useFormatter();
  const currentWeekStart = startOfWeek(new Date());
  const isCurrentWeek = isSameLocalDay(weekStart, currentWeekStart);
  const rangeStart = dateFromIsoCalendarDay(toIsoDate(weekStart));
  const rangeEnd = dateFromIsoCalendarDay(toIsoDate(weekEnd));

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t("weekPrevious")}
        onClick={() => onWeekStartChange(addWeeks(weekStart, -1))}
      >
        <ChevronLeft className="size-4" />
      </Button>

      <div className="min-w-[12rem] text-center">
        <p className="text-body-md font-semibold text-foreground">
          {format.dateTimeRange(
            rangeStart,
            rangeEnd,
            withUtcCalendarTimeZone({
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          )}
        </p>
        {isCurrentWeek ? (
          <p className="text-body-sm text-muted-foreground">{t("weekCurrent")}</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label={t("weekNext")}
        onClick={() => onWeekStartChange(addWeeks(weekStart, 1))}
      >
        <ChevronRight className="size-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isCurrentWeek}
        onClick={() => onWeekStartChange(currentWeekStart)}
      >
        {t("weekToday")}
      </Button>
    </div>
  );
}
