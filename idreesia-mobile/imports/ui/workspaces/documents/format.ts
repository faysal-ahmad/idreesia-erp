// Display formats and labels for documents, matching the web's document library.

/** The name of the library's top level. */
export const ROOT_NAME = 'Documents';

/** Dates come from the API as epoch milliseconds in a string. */
const toDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(/^\d+$/.test(value) ? Number(value) : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pad = (value: number) => String(value).padStart(2, '0');

/** DD-MM-YYYY hh:mm am/pm, as the web shows date-times. */
export const formatDateTime = (value?: string | null) => {
  const date = toDate(value);
  if (!date) return '';
  const hours = date.getHours();
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(
    hours % 12 || 12,
  )}:${pad(date.getMinutes())} ${hours < 12 ? 'am' : 'pm'}`;
};

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

/** "Faisal · 08-11-2026 03:00 pm", leaving out whichever part is missing. */
export const byLine = (name?: string | null, at?: string | null) =>
  [name, formatDateTime(at)].filter(Boolean).join(' · ');

export const parseDetails = (details?: string | null): Record<string, unknown> => {
  if (!details) return {};
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const version = (details: Record<string, unknown>, key = 'versionNumber') =>
  details[key] != null ? `version ${String(details[key])}` : 'a version';

/** What an activity entry did, e.g. "uploaded version 3" (as on the web). */
export const describeActivity = (action: string, details: Record<string, unknown>) => {
  switch (action) {
    case 'document-created':
      return 'added the document';
    case 'document-updated':
      return details.from && details.to
        ? `renamed it from "${String(details.from)}" to "${String(details.to)}"`
        : 'edited the details';
    case 'document-moved':
      return 'moved it';
    case 'document-copied':
      return 'made a copy';
    case 'document-trashed':
      return 'moved it to the trash';
    case 'document-restored':
      return 'restored it from the trash';
    case 'document-downloaded':
      return `downloaded ${version(details)}`;
    case 'document-checked-out':
      return 'checked it out';
    case 'document-checked-in':
      return 'checked it in';
    case 'document-force-unlocked':
      return 'removed the check-out lock';
    case 'version-added':
      return `uploaded ${version(details)}`;
    case 'version-restored':
      return `restored ${version(details, 'restoredFromVersionNumber')} as ${version(details)}`;
    case 'version-deleted':
      return `deleted ${version(details)}`;
    default:
      return action.replace(/-/g, ' ');
  }
};
