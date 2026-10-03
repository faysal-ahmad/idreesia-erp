export const ROSTER_TIME_ZONE = 'Asia/Karachi';

export const DAYS_OF_WEEK = [
  'Sat',
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
] as const;

export function todayInKarachi(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ROSTER_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}
