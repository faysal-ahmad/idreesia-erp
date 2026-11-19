// Duty days are calendar dates (YYYY-MM-DD) in Pakistan time, whatever time
// zone the browser is in.
const PLANNING_TIME_ZONE = 'Asia/Karachi';

export const todayInKarachi = (now = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: PLANNING_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

export const DAYS_OF_WEEK = [
  { value: 'Sat', label: 'Saturday' },
  { value: 'Sun', label: 'Sunday' },
  { value: 'Mon', label: 'Monday' },
  { value: 'Tue', label: 'Tuesday' },
  { value: 'Wed', label: 'Wednesday' },
  { value: 'Thu', label: 'Thursday' },
  { value: 'Fri', label: 'Friday' },
] as const;
