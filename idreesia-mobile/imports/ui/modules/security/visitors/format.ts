// Display formats for visitor fields, matching how the web app shows them.

// Dates come from the API as epoch milliseconds in a string.
const toDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(/^\d+$/.test(value) ? Number(value) : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const monthsSince = (date: Date) => {
  const now = new Date();
  let months = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
  if (now.getDate() < date.getDate()) months -= 1;
  return Math.max(0, months);
};

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;

/** "3 years, 2 months", as the web's ehad duration field shows it. */
export const formatDuration = (value?: string | null) => {
  const date = toDate(value);
  if (!date) return null;
  const months = monthsSince(date);
  const years = Math.floor(months / 12);
  const parts = [years ? plural(years, 'year') : null, months % 12 ? plural(months % 12, 'month') : null];
  return parts.filter(Boolean).join(', ') || 'Less than a month';
};

export const formatAge = (value?: string | null) => {
  const date = toDate(value);
  return date ? plural(Math.floor(monthsSince(date) / 12), 'year') : null;
};

/** DD-MM-YYYY, the app-wide date format (Formats.DATE_FORMAT). */
export const formatDate = (value?: string | null) => {
  const date = toDate(value);
  if (!date) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
};

export const formatDays = (days: number) => plural(days, 'day');
