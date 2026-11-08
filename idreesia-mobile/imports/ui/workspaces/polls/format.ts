// Display formats and labels for polls, matching the web's polls UI.

/** Dates come from the API as epoch milliseconds in a string. */
export const toDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(/^\d+$/.test(value) ? Number(value) : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pad = (value: number) => String(value).padStart(2, '0');
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** DD-MM-YYYY, as the web shows dates. */
export const formatDay = (date: Date) =>
  `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

/** hh:mm am/pm, as the web shows times. */
export const formatTime = (date: Date) => {
  const hours = date.getHours();
  return `${pad(hours % 12 || 12)}:${pad(date.getMinutes())} ${hours < 12 ? 'am' : 'pm'}`;
};

export const formatDateTime = (value?: string | null) => {
  const date = toDate(value);
  return date ? `${formatDay(date)} ${formatTime(date)}` : '';
};

/** "Mon 12-11-2026 04:00 pm" */
export const formatPollTime = (value?: string | null) => {
  const date = toDate(value);
  return date ? `${WEEKDAYS[date.getDay()]} ${formatDay(date)} ${formatTime(date)}` : '';
};

/** "in 3 hours", "2 days ago". */
export const formatRelative = (value?: string | null) => {
  const date = toDate(value);
  if (!date) return '';
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const units: Array<[number, string]> = [
    [24 * 3600e3, 'day'],
    [3600e3, 'hour'],
    [60e3, 'minute'],
  ];
  const [size, unit] = units.find(([ms]) => abs >= ms) ?? [60e3, 'minute'];
  const count = Math.max(1, Math.round(abs / size));
  const text = `${count} ${unit}${count === 1 ? '' : 's'}`;
  return diff >= 0 ? `in ${text}` : `${text} ago`;
};

/** When the poll ends or ended, for the list and the poll screen. */
export const describeClosing = (poll: {
  status?: string | null;
  closesAt?: string | null;
  closedAt?: string | null;
}) => {
  switch (poll.status) {
    case 'open':
      return `Closes ${formatRelative(poll.closesAt)}`;
    case 'closed':
      return `Closed ${formatDateTime(poll.closedAt ?? poll.closesAt)}`;
    case 'draft':
      return `Draft · set to close ${formatDateTime(poll.closesAt)}`;
    case 'cancelled':
      return 'Cancelled';
    default:
      return '';
  }
};

export const hasPassed = (value?: string | null) => Number(value) <= Date.now();

type TagColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';

export const STATUS: Record<string, { label: string; color: TagColor }> = {
  draft: { label: 'Draft', color: 'default' },
  open: { label: 'Open', color: 'primary' },
  closed: { label: 'Closed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'default' },
};

export const pollStatus = (status?: string | null) =>
  STATUS[status ?? ''] ?? { label: status ?? '', color: 'default' as TagColor };

/** "Choose one", "Choose 1 to 3", for a question's hint. */
export const choiceHint = (question: {
  type?: string | null;
  minChoices?: number | null;
  maxChoices?: number | null;
  optionCount: number;
}) => {
  if (question.type !== 'multiple') return 'Choose one';
  const min = question.minChoices ?? 1;
  const max = question.maxChoices ?? question.optionCount;
  if (min === max) return `Choose ${min}`;
  if (min <= 1 && max >= question.optionCount) return 'Choose any';
  return `Choose ${min} to ${max}`;
};

/** What an activity entry did, e.g. "opened the poll for voting" (as on the web). */
export const describeActivity = (action: string, details: Record<string, unknown>) => {
  switch (action) {
    case 'poll-created':
      return 'created the poll';
    case 'poll-updated':
      return 'edited the poll';
    case 'questions-updated':
      return 'changed the questions';
    case 'voters-added':
      return Array.isArray(details.voterIds)
        ? `added eligible voters (${details.voterIds.length})`
        : 'added eligible voters';
    case 'poll-opened':
      return 'opened the poll for voting';
    case 'poll-closed':
      return 'closed the poll';
    case 'poll-reopened':
      return 'reopened the poll';
    case 'poll-cancelled':
      return details.reason ? `cancelled the poll: ${String(details.reason)}` : 'cancelled the poll';
    case 'poll-deleted':
      return 'deleted the poll';
    case 'vote-cast':
      return 'voted';
    case 'vote-changed':
      return 'changed their vote';
    case 'vote-withdrawn':
      return 'withdrew their vote';
    default:
      return action.replace(/-/g, ' ');
  }
};
