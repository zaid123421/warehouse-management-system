import { parseServiceDate, startOfLocalDay } from "@/shared/lib/scheduling-cell-tone";

export const DAYS_IN_WEEK = 7;

/**
 * Warehouse planning calendar zone. Date-only values (`YYYY-MM-DD`) are civil days in this
 * zone; formatting always uses UTC noon anchors so headers never shift by timezone.
 */
export const SCHEDULING_CALENDAR_TIME_ZONE = "UTC";

/** `YYYY-MM-DD` in local time, matching the backend `LocalDate` wire format. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Build a Date whose UTC calendar day equals `isoDate` (noon UTC).
 * Safe to format with {@link withUtcCalendarTimeZone} without weekday shift.
 */
export function dateFromIsoCalendarDay(isoDate: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (!match) {
    return new Date(NaN);
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

/** Options for formatting calendar-only dates without timezone drift. */
export function withUtcCalendarTimeZone<T extends Intl.DateTimeFormatOptions>(
  options: T,
): T & { timeZone: string } {
  return { ...options, timeZone: SCHEDULING_CALENDAR_TIME_ZONE };
}

/** @deprecated Use {@link withUtcCalendarTimeZone}; kept for call-site compatibility. */
export function withLocalCalendarTimeZone<T extends Intl.DateTimeFormatOptions>(
  options: T,
): T & { timeZone: string } {
  return withUtcCalendarTimeZone(options);
}

export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
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

export function isSameIsoDate(isoDate: string, date: Date = new Date()): boolean {
  return isoDate.slice(0, 10) === toIsoDate(date);
}
