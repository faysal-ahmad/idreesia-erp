/**
 * Turns an error into a sentence a user can act on, or null when it has
 * nothing useful to say (the caller then shows its own fallback).
 *
 * - The server's `reason` (Meteor.Error) or `message` (GraphQL errors) is
 *   kept: it is written for users ("The face is too small...").
 * - Lost connections, whatever the layer (Apollo, fetch, XHR), all read
 *   the same: check your connection.
 * - Technical messages (status codes, JS errors, "Internal server error")
 *   are dropped rather than shown.
 */

export const CONNECTION_MESSAGE = 'Check your internet connection and try again.';

const NETWORK_PATTERN =
  /failed to fetch|network ?error|network request failed|load failed|internet connection appears to be offline|timed? ?out|ERR_(INTERNET|NETWORK|CONNECTION)/i;

const TECHNICAL_PATTERN =
  /^(response not successful|received status code|unexpected (token|end)|internal server error|cannot read propert|undefined is not|null is not|[a-z]*error:|\[object)/i;

export const describeError = (error: unknown): string | null => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return CONNECTION_MESSAGE;
  if (!error) return null;

  const { reason, message, networkError } =
    typeof error === 'object'
      ? (error as { reason?: unknown; message?: unknown; networkError?: unknown })
      : { reason: undefined, message: error, networkError: undefined };
  if (networkError) return CONNECTION_MESSAGE;

  const raw = [reason, message].find(value => typeof value === 'string' && value.trim());
  if (typeof raw !== 'string') return null;

  // Meteor.Error's message is "reason [code]"; the code means nothing to users.
  const text = raw.trim().replace(/\s*\[[\w-]+\]$/, '');
  if (NETWORK_PATTERN.test(text)) return CONNECTION_MESSAGE;
  if (TECHNICAL_PATTERN.test(text)) return null;
  return text;
};
