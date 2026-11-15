import { describe, expect, it } from 'vitest';

import { Users } from 'meteor/idreesia-common/server/collections/admin';

import {
  AttemptKind,
  BASE_BLOCK_MS,
  clearAttempts,
  FORGET_AFTER_MS,
  getBlockDuration,
  MAX_BLOCK_MS,
  MAX_FREE_ATTEMPTS,
  nextAttemptState,
  reserveAttempt,
} from './login-attempts';

const at = (ms: number) => new Date(Date.UTC(2026, 0, 1) + ms);

describe('getBlockDuration', () => {
  it('is free up to the limit, then doubles up to the maximum', () => {
    expect(getBlockDuration(MAX_FREE_ATTEMPTS - 1)).toBe(0);
    expect(getBlockDuration(MAX_FREE_ATTEMPTS)).toBe(BASE_BLOCK_MS);
    expect(getBlockDuration(MAX_FREE_ATTEMPTS + 1)).toBe(BASE_BLOCK_MS * 2);
    expect(getBlockDuration(MAX_FREE_ATTEMPTS + 30)).toBe(MAX_BLOCK_MS);
  });
});

describe('nextAttemptState', () => {
  it('starts counting at one', () => {
    expect(nextAttemptState(null, at(0))).toEqual({
      count: 1,
      lastAttemptAt: at(0),
      blockedUntil: null,
    });
  });

  it('blocks after the free attempts until the block ends', () => {
    const state = {
      count: MAX_FREE_ATTEMPTS - 1,
      lastAttemptAt: at(0),
      blockedUntil: null,
    };
    const blocked = nextAttemptState(state, at(1000));
    expect(blocked).toEqual({
      count: MAX_FREE_ATTEMPTS,
      lastAttemptAt: at(1000),
      blockedUntil: at(1000 + BASE_BLOCK_MS),
    });
    expect(nextAttemptState(blocked, at(1000 + BASE_BLOCK_MS - 1))).toBeNull();
    expect(nextAttemptState(blocked, at(1000 + BASE_BLOCK_MS))?.count).toBe(
      MAX_FREE_ATTEMPTS + 1
    );
  });

  it('forgets old attempts', () => {
    const state = { count: 3, lastAttemptAt: at(0), blockedUntil: null };
    expect(nextAttemptState(state, at(FORGET_AFTER_MS + 1))?.count).toBe(1);
  });
});

describe('reserveAttempt', () => {
  it('counts attempts per user until blocked, and clearing resets', async () => {
    await Users.insertAsync({ _id: 'u1', username: 'ali' });

    for (let i = 0; i < MAX_FREE_ATTEMPTS; i += 1) {
       
      expect(await reserveAttempt('u1', AttemptKind.LOGIN)).toBe(true);
    }
    expect(await reserveAttempt('u1', AttemptKind.LOGIN)).toBe(false);
    // Each kind of attempt is counted separately.
    expect(await reserveAttempt('u1', AttemptKind.TWO_FACTOR_CODE)).toBe(true);

    await clearAttempts('u1', AttemptKind.LOGIN);
    expect(await reserveAttempt('u1', AttemptKind.LOGIN)).toBe(true);
  });

  it('counts parallel attempts without losing any', async () => {
    await Users.insertAsync({ _id: 'u2', username: 'bilal' });

    const results = await Promise.all(
      Array.from({ length: MAX_FREE_ATTEMPTS + 3 }, () =>
        reserveAttempt('u2', AttemptKind.LOGIN)
      )
    );
    expect(results.filter(Boolean)).toHaveLength(MAX_FREE_ATTEMPTS);
  });

  it('refuses unknown users', async () => {
    expect(await reserveAttempt('missing', AttemptKind.LOGIN)).toBe(false);
  });
});
