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
