// Duty days are calendar dates (YYYY-MM-DD) in Pakistan time, whatever time
// zone the phone is in. Dates are handled as strings, so no time zone can
// shift them.
const PLANNING_TIME_ZONE = 'Asia/Karachi';

export const todayInKarachi = (now = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: PLANNING_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

const toUtc = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const fromUtc = (date: Date) => date.toISOString().slice(0, 10);

export const addDays = (date: string, days: number) => {
  const next = toUtc(date);
  next.setUTCDate(next.getUTCDate() + days);
  return fromUtc(next);
};

/** MM-YYYY, as the attendance sheet asks for it. */
export const monthOf = (date: string) => `${date.slice(5, 7)}-${date.slice(0, 4)}`;

export const addMonths = (date: string, months: number) => {
  const next = toUtc(`${date.slice(0, 7)}-01`);
  next.setUTCMonth(next.getUTCMonth() + months);
  return fromUtc(next);
};

const long = (options: Intl.DateTimeFormatOptions) => (date: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...options }).format(toUtc(date));

/** "Mon, 03 Nov 2026" */
export const formatLongDate = long({ weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
/** "03 Nov" */
export const formatShortDate = long({ day: '2-digit', month: 'short' });
/** "November 2026" */
export const formatMonth = long({ month: 'long', year: 'numeric' });

/** A JS Date for a DatePicker, built from local parts so the picker shows the same day. */
export const toPickerDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const fromPickerDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const DAYS_OF_WEEK = [
  { value: 'Sat', label: 'Saturday' },
  { value: 'Sun', label: 'Sunday' },
  { value: 'Mon', label: 'Monday' },
  { value: 'Tue', label: 'Tuesday' },
  { value: 'Wed', label: 'Wednesday' },
  { value: 'Thu', label: 'Thursday' },
  { value: 'Fri', label: 'Friday' },
] as const;
