export const PLANNING_TIME_ZONE = 'Asia/Karachi';

export const DAYS_OF_WEEK = [
  'Sat',
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (
    utc.getUTCFullYear() === year &&
    utc.getUTCMonth() === month - 1 &&
    utc.getUTCDate() === day
  );
}

export function isDayOfWeek(value: unknown): value is DayOfWeek {
  return (
    typeof value === 'string' &&
    (DAYS_OF_WEEK as readonly string[]).includes(value)
  );
}

export function formatKarachiDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PLANNING_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function todayInKarachi(now = new Date()): string {
  return formatKarachiDate(now);
}

export function addCalendarDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return formatKarachiDate(new Date(Date.UTC(year, month - 1, day + days, 12)));
}

export function dayOfWeek(date: string): DayOfWeek {
  const [year, month, day] = date.split('-').map(Number);
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: PLANNING_TIME_ZONE,
    weekday: 'short',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
  return formatted as DayOfWeek;
}

export function datesMatchingWeekday(
  startDate: string,
  endDate: string,
  weekday: DayOfWeek
): string[] {
  if (startDate > endDate) return [];

  let cursor = startDate;
  while (cursor <= endDate && dayOfWeek(cursor) !== weekday) {
    cursor = addCalendarDays(cursor, 1);
  }

  const dates: string[] = [];
  while (cursor <= endDate) {
    dates.push(cursor);
    cursor = addCalendarDays(cursor, 7);
  }
  return dates;
}

/**
 * The Karachi time of day of a timestamp, in minutes since midnight. Shift
 * times are stored as timestamps whose date is arbitrary, so only this part
 * means anything. Null when the value is empty or not a date.
 */
export function karachiMinutesOfDay(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: PLANNING_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
  return part('hour') * 60 + part('minute');
}

/** The moment a Karachi calendar date and time of day (minutes) refer to. */
export function karachiDateTime(date: string, minutes: number): Date {
  const [year, month, day] = date.split('-').map(Number);
  // Karachi is UTC+5 all year (no daylight saving).
  return new Date(Date.UTC(year, month - 1, day, 0, minutes - 5 * 60));
}
