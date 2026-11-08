// Display formats and labels for meetings, matching the web's meetings UI.

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

export const formatDate = (value?: string | null) => {
  const date = toDate(value);
  return date ? formatDay(date) : '';
};

export const formatDateTime = (value?: string | null) => {
  const date = toDate(value);
  return date ? `${formatDay(date)} ${formatTime(date)}` : '';
};

/** "Mon 12-11-2026, 04:00 pm - 05:30 pm" (the end date only if different). */
export const formatMeetingTime = (startsAt?: string | null, endsAt?: string | null) => {
  const start = toDate(startsAt);
  const end = toDate(endsAt);
  if (!start || !end) return '';
  const sameDay = start.toDateString() === end.toDateString();
  return `${WEEKDAYS[start.getDay()]} ${formatDay(start)}, ${formatTime(start)} - ${
    sameDay ? formatTime(end) : `${formatDay(end)} ${formatTime(end)}`
  }`;
};

/** The same range on two lines: ["Sun 08-11-2026", "03:00 pm - 04:00 pm"]. */
export const formatMeetingTimeLines = (startsAt?: string | null, endsAt?: string | null) => {
  const start = toDate(startsAt);
  const end = toDate(endsAt);
  if (!start || !end) return [];
  const day = `${WEEKDAYS[start.getDay()]} ${formatDay(start)}`;
  if (start.toDateString() === end.toDateString()) {
    return [day, `${formatTime(start)} - ${formatTime(end)}`];
  }
  return [`${day}, ${formatTime(start)}`, `to ${WEEKDAYS[end.getDay()]} ${formatDay(end)}, ${formatTime(end)}`];
};

export const hasStarted = (startsAt?: string | null) => Number(startsAt) <= Date.now();
export const hasEnded = (endsAt?: string | null) => Number(endsAt) <= Date.now();

export const formatSize = (size?: number | null) => {
  if (size == null) return '';
  if (size < 1024) return `${size} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = size / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
};

type TagColor = 'default' | 'primary' | 'success' | 'warning' | 'danger';

/** The status tag, with "In progress" / "Ended" by the meeting's times. */
export const meetingStatus = (
  status?: string | null,
  startsAt?: string | null,
  endsAt?: string | null,
): { label: string; color: TagColor } => {
  if (status === 'completed') return { label: 'Completed', color: 'success' };
  if (status === 'cancelled') return { label: 'Cancelled', color: 'default' };
  if (hasStarted(startsAt)) {
    return hasEnded(endsAt)
      ? { label: 'Ended', color: 'default' }
      : { label: 'In progress', color: 'primary' };
  }
  return { label: 'Scheduled', color: 'primary' };
};

export const ROLE_LABELS: Record<string, string> = {
  organizer: 'Organizer',
  required: 'Required',
  optional: 'Optional',
};

export const RSVP_LABELS: Record<string, string> = {
  pending: 'No response',
  accepted: 'Accepted',
  declined: 'Declined',
  tentative: 'Tentative',
};

export const RSVP_COLORS: Record<string, TagColor> = {
  pending: 'default',
  accepted: 'success',
  declined: 'danger',
  tentative: 'warning',
};

export const ATTENDANCE_LABELS: Record<string, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
};

export const ACTION_ITEM_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const ACTION_ITEM_COLORS: Record<string, TagColor> = {
  open: 'primary',
  'in-progress': 'warning',
  done: 'success',
  cancelled: 'default',
};

/** What an activity entry did, e.g. "rescheduled the meeting" (as on the web). */
export const describeActivity = (action: string, details: Record<string, unknown>) => {
  const quoted = (key: string) => (details[key] ? ` "${String(details[key])}"` : '');
  switch (action) {
    case 'meeting-created':
      return 'scheduled the meeting';
    case 'meeting-updated':
      return 'edited the details';
    case 'meeting-rescheduled':
      return 'rescheduled the meeting';
    case 'meeting-cancelled':
      return details.reason ? `cancelled the meeting: ${String(details.reason)}` : 'cancelled the meeting';
    case 'meeting-reopened':
      return 'reopened the meeting';
    case 'meeting-completed':
      return 'marked the meeting completed';
    case 'participants-added':
      return 'invited participants';
    case 'participant-removed':
      return 'removed a participant';
    case 'participant-role-changed':
      return "changed a participant's role";
    case 'invitation-responded':
      return details.status
        ? `responded: ${RSVP_LABELS[String(details.status)] ?? String(details.status)}`
        : 'responded to the invitation';
    case 'attendance-marked':
      return 'recorded attendance';
    case 'agenda-item-added':
      return `added agenda item${quoted('title')}`;
    case 'agenda-item-updated':
      return 'edited an agenda item';
    case 'agenda-item-removed':
      return `removed agenda item${quoted('title')}`;
    case 'agenda-reordered':
      return 'reordered the agenda';
    case 'minutes-updated':
      return details.cleared ? 'cleared the minutes' : 'updated the minutes';
    case 'attachment-added':
      return `attached${quoted('name')}`;
    case 'attachment-updated':
      return 'edited an attachment';
    case 'attachment-deleted':
      return `deleted attachment${quoted('name')}`;
    case 'attachment-downloaded':
      return 'downloaded an attachment';
    case 'action-item-created':
      return `added action item${quoted('title')}`;
    case 'action-item-updated':
      return 'edited an action item';
    case 'action-item-status-changed':
      return details.to
        ? `marked an action item ${ACTION_ITEM_STATUS_LABELS[String(details.to)] ?? String(details.to)}`
        : 'changed an action item';
    case 'action-item-deleted':
      return `deleted action item${quoted('title')}`;
    default:
      return action.replace(/-/g, ' ');
  }
};
