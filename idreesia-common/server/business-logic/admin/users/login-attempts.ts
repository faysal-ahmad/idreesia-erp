import { Users } from 'meteor/idreesia-common/server/collections/admin';

// Throttles password logins and two-factor code checks per account, so a
// password or a two-factor code can't be guessed by brute force. The state is
// kept on the user document, so every web instance shares it.
//
// An attempt is counted before the credentials are checked (reserveAttempt),
// in one atomic update, so a burst of parallel requests can't all slip in
// before the first failure is recorded. A successful attempt clears the
// count. The first MAX_FREE_ATTEMPTS attempts are free; from then on each
// attempt blocks the next one for BASE_BLOCK_MS, doubling every time, up to
// MAX_BLOCK_MS. The count is forgotten FORGET_AFTER_MS after the last attempt.

export const MAX_FREE_ATTEMPTS = 5;
export const BASE_BLOCK_MS = 15 * 60 * 1000;
export const MAX_BLOCK_MS = 24 * 60 * 60 * 1000;
export const FORGET_AFTER_MS = 24 * 60 * 60 * 1000;

/** Meteor.Error code (error.error) for a throttled attempt. */
export const TOO_MANY_ATTEMPTS_ERROR = 'too-many-attempts';
export const TOO_MANY_ATTEMPTS_MESSAGE =
  'Too many failed attempts. Please try again later.';

/** The user document field that throttles each kind of attempt. */
export const AttemptKind = {
  /** Password logins (Meteor and REST), including their two-factor code. */
  LOGIN: 'loginAttempts',
  /** Two-factor codes entered while logged in, to enable or disable it. */
  TWO_FACTOR_CODE: 'twoFactorCodeAttempts',
} as const;

export type AttemptKindValue = (typeof AttemptKind)[keyof typeof AttemptKind];

export interface AttemptState {
  count: number;
  lastAttemptAt: Date;
  blockedUntil?: Date | null;
}

/** How long the attempt numbered `count` blocks the next one. */
export const getBlockDuration = (count: number) =>
  count < MAX_FREE_ATTEMPTS
    ? 0
    : Math.min(BASE_BLOCK_MS * 2 ** (count - MAX_FREE_ATTEMPTS), MAX_BLOCK_MS);

/** The state after one more attempt, or null if attempts are blocked now. */
export function nextAttemptState(
  state: AttemptState | null | undefined,
  now: Date
): AttemptState | null {
  if (state?.blockedUntil && state.blockedUntil > now) return null;

  const forgotten =
    !state || now.getTime() - state.lastAttemptAt.getTime() > FORGET_AFTER_MS;
  const count = forgotten ? 1 : state.count + 1;
  const blockFor = getBlockDuration(count);
  return {
    count,
    lastAttemptAt: now,
    blockedUntil: blockFor ? new Date(now.getTime() + blockFor) : null,
  };
}

/**
 * Counts an attempt for the user before their credentials are checked.
 * Returns false (and counts nothing) while attempts are blocked. Retries if
 * another request changed the count at the same moment.
 */
export async function reserveAttempt(
  userId: string,
  kind: AttemptKindValue
): Promise<boolean> {
  for (let retry = 0; retry < 10; retry += 1) {
    const user = await Users.findOneAsync(userId, { fields: { [kind]: 1 } });
    if (!user) return false;

    const current = user[kind] as AttemptState | undefined;
    const next = nextAttemptState(current, new Date());
    if (!next) return false;

    // Only applies if nobody else counted an attempt since the read above.
    // Two attempts can share a millisecond, so the count is matched too.
    const updated = await Users.updateAsync(
      current
        ? {
            _id: userId,
            [`${kind}.count`]: current.count,
            [`${kind}.lastAttemptAt`]: current.lastAttemptAt,
          }
        : { _id: userId, [kind]: { $exists: false } },
      { $set: { [kind]: next } }
    );
    if (updated > 0) return true;
  }
  // Only under a flood of simultaneous attempts on this account.
  return false;
}

/** Clears the count after a successful attempt. */
export async function clearAttempts(
  userId: string,
  kind: AttemptKindValue
): Promise<void> {
  await Users.updateAsync(userId, { $unset: { [kind]: '' } });
}
