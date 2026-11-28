import { format, isValid } from 'date-fns';

// Shift times as both HR modules show them (duty shifts and job shifts).

export const formatShiftTime = (value?: string | null) => {
  if (!value) return '';
  const time = new Date(value);
  return isValid(time) ? format(time, 'h:mm aaa') : '';
};

const minutesOfDay = (value?: string | null) => {
  if (!value) return null;
  const time = new Date(value);
  if (!isValid(time)) return null;
  return time.getHours() * 60 + time.getMinutes();
};

export const formatShiftDuration = (
  startValue?: string | null,
  endValue?: string | null
) => {
  const startMinutes = minutesOfDay(startValue);
  const endMinutes = minutesOfDay(endValue);
  if (startMinutes == null || endMinutes == null) return '-';

  let minutes = endMinutes - startMinutes;
  if (minutes < 0) minutes += 24 * 60;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};
