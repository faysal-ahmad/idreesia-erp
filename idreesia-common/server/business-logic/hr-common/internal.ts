import { hrError } from './errors';

export interface ActingUser {
  _id: string;
}

const MAX_NAME_LENGTH = 255;

export const cleanText = (value?: string | null): string | undefined => {
  const text = value?.trim();
  return text || undefined;
};

/** A required single-line text: trimmed, whitespace collapsed, bounded. */
export function requireText(
  value: string | null | undefined,
  what: string,
  maxLength = MAX_NAME_LENGTH
): string {
  const text = (value ?? '').trim().replace(/\s+/g, ' ');
  if (!text) throw hrError('BAD_USER_INPUT', `${what} is required.`);
  if (text.length > maxLength) {
    throw hrError('BAD_USER_INPUT', `${what} is too long.`);
  }
  return text;
}

/**
 * A date from the API: milliseconds since the epoch (as a number or a digit
 * string, which is what the web app sends), an ISO string or a Date. Blank is
 * "no date".
 */
export function parseHrDate(
  value: string | number | Date | null | undefined
): Date | null {
  if (value === null || value === undefined || value === '') return null;
  let date: Date;
  if (value instanceof Date) date = new Date(value);
  else if (typeof value === 'number') date = new Date(value);
  else {
    const text = value.trim();
    if (!text) return null;
    date = /^\d+$/.test(text) ? new Date(Number(text)) : new Date(text);
  }
  if (Number.isNaN(date.getTime())) {
    throw hrError('BAD_USER_INPUT', 'That date is not valid.');
  }
  return date;
}

/** Like parseHrDate, for a date that must be given. */
export function requireHrDate(
  value: string | number | Date | null | undefined,
  what: string
): Date {
  const date = parseHrDate(value);
  if (!date) throw hrError('BAD_USER_INPUT', `Please enter the ${what}.`);
  return date;
}
