import { securityError } from './errors';

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
  if (!text) throw securityError('BAD_USER_INPUT', `${what} is required.`);
  if (text.length > maxLength) {
    throw securityError('BAD_USER_INPUT', `${what} is too long.`);
  }
  return text;
}
