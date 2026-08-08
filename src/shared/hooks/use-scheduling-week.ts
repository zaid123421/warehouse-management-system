"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildWeekDates,
  resolveWeekStart,
  startOfWeek,
  toIsoDate,
} from "@/shared/lib/scheduling-week";

/**
 * Week shown by a scheduling board, kept in `?weekStart=YYYY-MM-DD` so a board view can be
 * shared or reloaded. Defaults to the current week.
 */
export function useSchedulingWeek(param = "weekStart") {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawWeekStart = searchParams.get(param);

  const weekStart = useMemo(() => resolveWeekStart(rawWeekStart), [rawWeekStart]);
  const weekStartIso = toIsoDate(weekStart);
  const weekDates = useMemo(() => buildWeekDates(weekStart), [weekStart]);

  const setWeekStart = useCallback(
    (next: Date) => {
      const url = new URL(window.location.href);
      const normalized = startOfWeek(next);
      if (toIsoDate(normalized) === toIsoDate(startOfWeek(new Date()))) {
        url.searchParams.delete(param);
      } else {
        url.searchParams.set(param, toIsoDate(normalized));
      }
      router.replace(`${url.pathname}${url.search}`, { scroll: false });
    },
    [param, router],
  );

  return {
    weekStart,
    weekStartIso,
    weekEnd: weekDates[weekDates.length - 1],
    weekDates,
    setWeekStart,
  };
}
