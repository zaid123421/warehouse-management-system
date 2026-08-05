export type SchedulingCellTone = "scheduled" | "due" | "upcoming" | "neutral";

const WEEKDAY_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const MS_PER_HOUR = 60 * 60 * 1000;
const ACTION_WINDOW_MS = 48 * MS_PER_HOUR;

/** Local calendar date at 00:00:00. */
export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Parse `YYYY-MM-DD` (or ISO datetime) as a local calendar day. */
export function parseServiceDate(value?: string | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]) - 1;
    const day = Number(dateOnly[3]);
    const parsed = new Date(year, month, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return startOfLocalDay(parsed);
}

/** Next occurrence of weekday on/after `from` (including today). */
export function nextDateForWeekday(weekday: string, from: Date = new Date()): Date | null {
  const target = WEEKDAY_INDEX[weekday.trim().toUpperCase()];
  if (target == null) return null;
  const start = startOfLocalDay(from);
  const diff = (target - start.getDay() + 7) % 7;
  start.setDate(start.getDate() + diff);
  return start;
}

export function resolveSchedulingServiceDate(options: {
  serviceDate?: string | null;
  weekday?: string | null;
  now?: Date;
}): Date | null {
  const fromService = parseServiceDate(options.serviceDate);
  if (fromService) return fromService;
  if (options.weekday) return nextDateForWeekday(options.weekday, options.now ?? new Date());
  return null;
}

/**
 * Cell color tone for the scheduling board:
 * - scheduled: fully approved (green)
 * - due: within 48h before service day through end of service day (or overdue)
 * - upcoming: more than 48h before service day
 */
export function getSchedulingCellTone(options: {
  status: string;
  serviceDate?: string | null;
  weekday?: string | null;
  now?: Date;
}): SchedulingCellTone {
  if (options.status === "APPROVED") return "scheduled";

  const now = options.now ?? new Date();
  const serviceDay = resolveSchedulingServiceDate({
    serviceDate: options.serviceDate,
    weekday: options.weekday,
    now,
  });
  if (!serviceDay) return "neutral";

  const serviceStart = startOfLocalDay(serviceDay);
  const serviceEnd = new Date(serviceStart.getTime() + 24 * MS_PER_HOUR - 1);
  const windowStart = new Date(serviceStart.getTime() - ACTION_WINDOW_MS);

  if (now.getTime() < windowStart.getTime()) return "upcoming";
  if (now.getTime() <= serviceEnd.getTime()) return "due";
  return "due";
}

export function schedulingCellToneClassNames(
  tone: SchedulingCellTone,
  isSelected: boolean,
): string {
  if (isSelected) {
    switch (tone) {
      case "scheduled":
        return "border-emerald-600 bg-emerald-500/20 ring-2 ring-emerald-500/50";
      case "due":
        return "border-amber-600 bg-amber-500/25 ring-2 ring-amber-500/50";
      case "upcoming":
        return "border-sky-600 bg-sky-500/20 ring-2 ring-sky-500/50";
      default:
        return "border-primary bg-primary/5 ring-2 ring-primary/30";
    }
  }

  switch (tone) {
    case "scheduled":
      return "border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/15 dark:border-emerald-400/40 dark:bg-emerald-500/15";
    case "due":
      return "border-amber-500/55 bg-amber-500/15 hover:bg-amber-500/20 dark:border-amber-400/45 dark:bg-amber-500/20";
    case "upcoming":
      return "border-sky-500/45 bg-sky-500/10 hover:bg-sky-500/15 dark:border-sky-400/40 dark:bg-sky-500/15";
    default:
      return "border-[var(--color-surface-light-container)] bg-card hover:bg-muted/40 dark:border-[var(--color-surface-container-high)]";
  }
}
