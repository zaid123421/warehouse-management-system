import { parseServiceDate, startOfLocalDay } from "@/shared/lib/scheduling-cell-tone";

export const DAYS_IN_WEEK = 7;

/** `YYYY-MM-DD` in local time, matching the backend `LocalDate` wire format. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Browser/runtime IANA zone used when formatting calendar-only {@link Date} values.
 * Without an explicit zone, next-intl may format midnight local dates in UTC and shift
 * the displayed weekday back by one day (e.g. Monday 00:00 in UTC+3 → Sunday).
 */
export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

/** Merge formatter options so calendar dates keep their local civil day. */
export function withLocalCalendarTimeZone<T extends Intl.DateTimeFormatOptions>(
  options: T,
): T & { timeZone: string } {
  return { ...options, timeZone: getLocalTimeZone() };
}

/** Monday of the week containing `date`, matching the backend `PlanningWeek`. */
export function startOfWeek(date: Date): Date {
  const start = startOfLocalDay(date);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

export function addWeeks(date: Date, weeks: number): Date {
  const shifted = startOfLocalDay(date);
  shifted.setDate(shifted.getDate() + weeks * DAYS_IN_WEEK);
  return shifted;
}

/** Monday through Sunday of the week starting at `weekStart`. */
export function buildWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: DAYS_IN_WEEK }, (_, offset) => {
    const day = startOfLocalDay(weekStart);
    day.setDate(day.getDate() + offset);
    return day;
  });
}

/**
 * Monday of the week for a `?weekStart=` URL value, falling back to the current week when the
 * value is missing or unparseable.
 */
export function resolveWeekStart(value?: string | null, now: Date = new Date()): Date {
  const parsed = parseServiceDate(value);
  return startOfWeek(parsed ?? now);
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
