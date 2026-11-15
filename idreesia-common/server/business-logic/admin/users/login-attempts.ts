import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  LoginAttempts,
  Users,
  type LoginAttemptDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import { findOneUser, type MappedUser } from './map-user';
import { assertCanManageUser } from './super-admin';

// Throttles password logins and two-factor code checks, so a password or a
// two-factor code can't be guessed by brute force.
//
// An attempt is counted before the credentials are checked, in one atomic
// write, so a burst of parallel requests can't all slip in before the first
// failure is recorded. A successful attempt clears the count. The first
// MAX_FREE_ATTEMPTS attempts are free; from then on each attempt blocks the
// next one for BASE_BLOCK_MS, doubling every time, up to MAX_BLOCK_MS. The
// count is forgotten FORGET_AFTER_MS after the last attempt.
//
// Password logins are counted per account AND client address (LoginAttempts),
// so someone who only knows a user name can block their own address but not
// the account's owner logging in from somewhere else. To stop a password
// being guessed slowly from many addresses, the account also has a looser
// cap: once its addresses have made MAX_ACCOUNT_ATTEMPTS attempts in
// FORGET_AFTER_MS, only addresses the account has logged in from successfully
// in the last TRUST_ADDRESS_MS may try. An admin can clear all of it
// (clearLoginBlocks).
//
// Two-factor codes entered while logged in are counted per account on the
// user document (reserveAttempt): only the logged-in user can make them.

export const MAX_FREE_ATTEMPTS = 5;
export const BASE_BLOCK_MS = 15 * 60 * 1000;
export const MAX_BLOCK_MS = 24 * 60 * 60 * 1000;
export const FORGET_AFTER_MS = 24 * 60 * 60 * 1000;
export const MAX_ACCOUNT_ATTEMPTS = 100;
export const TRUST_ADDRESS_MS = 90 * 24 * 60 * 60 * 1000;

/** Meteor.Error code (error.error) for a throttled attempt. */
export const TOO_MANY_ATTEMPTS_ERROR = 'too-many-attempts';
export const TOO_MANY_ATTEMPTS_MESSAGE =
  'Too many failed attempts. Please try again later.';

/** The user document field that throttles each kind of per-account attempt. */
export const AttemptKind = {
  /** Two-factor codes entered while logged in, to enable or disable it. */
  TWO_FACTOR_CODE: 'twoFactorCodeAttempts',
} as const;

export type AttemptKindValue = (typeof AttemptKind)[keyof typeof AttemptKind];

export interface AttemptState {
  count: number;
  lastAttemptAt: Date;
  blockedUntil?: Date | null;
}

interface UserRef {
  _id: string;
}

const MAX_WRITE_RETRIES = 10;

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

// ----------------------------------------------------------------------------
// Password logins: per account and client address
// ----------------------------------------------------------------------------

const getLoginAttemptId = (userId: string, clientAddress: string) =>
  `${userId}|${clientAddress}`;

const isTrusted = (doc: LoginAttemptDocument | undefined, now: Date) =>
  !!doc?.trustedUntil && doc.trustedUntil > now;

const isDuplicateKeyError = (error: unknown) =>
  (error as { code?: number } | null)?.code === 11000;

/**
 * Attempts the account's untrusted addresses made in the last
 * FORGET_AFTER_MS. Counted outside the atomic write below, so a burst of
 * parallel attempts can pass it by a few; it is a loose cap, and each
 * address is still held to its own exact count.
 */
async function countRecentUntrustedAttempts(userId: string, now: Date) {
  const docs = await LoginAttempts.find(
    {
      userId,
      lastAttemptAt: { $gt: new Date(now.getTime() - FORGET_AFTER_MS) },
      $or: [{ trustedUntil: null }, { trustedUntil: { $lte: now } }],
    },
    { fields: { count: 1 } }
  ).fetchAsync();
  return docs.reduce((total, doc) => total + doc.count, 0);
}

/**
 * Counts a password login attempt for the user from the client address,
 * before the credentials are checked. Returns false (and counts nothing)
 * while attempts from that address are blocked, or while the account's cap
 * is reached and the address hasn't logged in successfully before. Retries
 * if another request changed the count at the same moment.
 */
export async function reserveLoginAttempt(
  userId: string,
  clientAddress: string
): Promise<boolean> {
  const _id = getLoginAttemptId(userId, clientAddress);

  for (let retry = 0; retry < MAX_WRITE_RETRIES; retry += 1) {
    const now = new Date();
    const current = await LoginAttempts.findOneAsync(_id);
    const trusted = isTrusted(current, now);

    if (
      !trusted &&
      (await countRecentUntrustedAttempts(userId, now)) >= MAX_ACCOUNT_ATTEMPTS
    ) {
      return false;
    }

    const next = nextAttemptState(current, now);
    if (!next) return false;

    const fields = {
      ...next,
      // A trusted address keeps its trust (and its document) for as long as
      // the trust lasts.
      expiresAt: trusted
        ? current!.trustedUntil!
        : new Date(now.getTime() + FORGET_AFTER_MS),
    };

    if (!current) {
      try {
        await LoginAttempts.insertAsync({
          _id,
          userId,
          clientAddress,
          trustedUntil: null,
          ...fields,
        });
        return true;
      } catch (error) {
        // Another request counted the first attempt at the same moment.
        if (!isDuplicateKeyError(error)) throw error;
        continue;
      }
    }

    // Only applies if nobody else counted an attempt since the read above.
    // Two attempts can share a millisecond, so the count is matched too.
    const updated = await LoginAttempts.updateAsync(
      { _id, count: current.count, lastAttemptAt: current.lastAttemptAt },
      { $set: fields }
    );
    if (updated > 0) return true;
  }
  // Only under a flood of simultaneous attempts on this account and address.
  return false;
}

/**
 * Clears the count after a successful login, and trusts the address for
 * TRUST_ADDRESS_MS so it can still log in while the account's cap is reached.
 */
export async function clearLoginAttempts(
  userId: string,
  clientAddress: string
): Promise<void> {
  const now = new Date();
  const trustedUntil = new Date(now.getTime() + TRUST_ADDRESS_MS);
  await LoginAttempts.updateAsync(
    getLoginAttemptId(userId, clientAddress),
    {
      $set: {
        userId,
        clientAddress,
        count: 0,
        lastAttemptAt: now,
        blockedUntil: null,
        trustedUntil,
        expiresAt: trustedUntil,
      },
    },
    { upsert: true }
  );
}

export interface LoginBlockStatus {
  /** Addresses that may not try to log in to the account right now. */
  blockedAddresses: number;
  /** Whether the account's cap is reached, so only trusted addresses may try. */
  untrustedAddressesBlocked: boolean;
}

/** Whether, and how widely, the user's password logins are blocked now. */
export async function getLoginBlockStatus(
  userId: string
): Promise<LoginBlockStatus> {
  const now = new Date();
  const blockedAddresses = await LoginAttempts.find({
    userId,
    blockedUntil: { $gt: now },
  }).countAsync();
  const untrustedAddressesBlocked =
    (await countRecentUntrustedAttempts(userId, now)) >= MAX_ACCOUNT_ATTEMPTS;
  return { blockedAddresses, untrustedAddressesBlocked };
}

/**
 * Lifts every block on the user's password logins (for an account kept
 * locked out by someone else's wrong passwords). Addresses the user has
 * logged in from stay trusted.
 */
export async function clearLoginBlocks(
  { userId }: { userId: string },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  return runInTransaction(async () => {
    await assertCanManageUser(userId, user);
    if (!(await Users.findOneAsync(userId, { fields: { _id: 1 } }))) {
      throw new Error('User not found.');
    }

    const now = new Date();
    const untrusted = {
      userId,
      $or: [{ trustedUntil: null }, { trustedUntil: { $lte: now } }],
    };
    await LoginAttempts.removeAsync(untrusted);
    await LoginAttempts.updateAsync(
      { userId, trustedUntil: { $gt: now } },
      { $set: { count: 0, blockedUntil: null } },
      { multi: true }
    );

    await SecurityLogs.insertAsync({
      userId,
      operationType: SecurityOperationType.LOGIN_BLOCKS_CLEARED,
      operationBy: user._id,
      operationTime: now,
      dataSource,
      dataSourceDetail,
    });

    return findOneUser(userId);
  });
}

// ----------------------------------------------------------------------------
// Two-factor codes entered while logged in: per account
// ----------------------------------------------------------------------------

/**
 * Counts an attempt for the user before their credentials are checked.
 * Returns false (and counts nothing) while attempts are blocked. Retries if
 * another request changed the count at the same moment.
 */
export async function reserveAttempt(
  userId: string,
  kind: AttemptKindValue
): Promise<boolean> {
  for (let retry = 0; retry < MAX_WRITE_RETRIES; retry += 1) {
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
