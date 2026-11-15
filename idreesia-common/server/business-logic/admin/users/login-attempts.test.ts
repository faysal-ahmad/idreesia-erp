import { describe, expect, it } from 'vitest';

import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  LoginAttempts,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import {
  AttemptKind,
  BASE_BLOCK_MS,
  clearAttempts,
  clearLoginAttempts,
  clearLoginBlocks,
  FORGET_AFTER_MS,
  getBlockDuration,
  getLoginBlockStatus,
  MAX_ACCOUNT_ATTEMPTS,
  MAX_BLOCK_MS,
  MAX_FREE_ATTEMPTS,
  nextAttemptState,
  reserveAttempt,
  reserveLoginAttempt,
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
      expect(await reserveAttempt('u1', AttemptKind.TWO_FACTOR_CODE)).toBe(true);
    }
    expect(await reserveAttempt('u1', AttemptKind.TWO_FACTOR_CODE)).toBe(false);

    await clearAttempts('u1', AttemptKind.TWO_FACTOR_CODE);
    expect(await reserveAttempt('u1', AttemptKind.TWO_FACTOR_CODE)).toBe(true);
  });

  it('counts parallel attempts without losing any', async () => {
    await Users.insertAsync({ _id: 'u2', username: 'bilal' });

    const results = await Promise.all(
      Array.from({ length: MAX_FREE_ATTEMPTS + 3 }, () =>
        reserveAttempt('u2', AttemptKind.TWO_FACTOR_CODE)
      )
    );
    expect(results.filter(Boolean)).toHaveLength(MAX_FREE_ATTEMPTS);
  });

  it('refuses unknown users', async () => {
    expect(await reserveAttempt('missing', AttemptKind.TWO_FACTOR_CODE)).toBe(
      false
    );
  });
});

const useUpAttempts = async (userId: string, clientAddress: string) => {
  for (let i = 0; i < MAX_FREE_ATTEMPTS; i += 1) {
    expect(await reserveLoginAttempt(userId, clientAddress)).toBe(true);
  }
};

/** Fills the account's cap with failed attempts from addresses it never logged in from. */
const reachAccountCap = async (userId: string) => {
  const now = new Date();
  const docs = Array.from(
    { length: Math.ceil(MAX_ACCOUNT_ATTEMPTS / MAX_FREE_ATTEMPTS) },
    (_, i) => ({
      _id: `${userId}|10.0.0.${i}`,
      userId,
      clientAddress: `10.0.0.${i}`,
      count: MAX_FREE_ATTEMPTS,
      lastAttemptAt: now,
      blockedUntil: new Date(now.getTime() + BASE_BLOCK_MS),
      trustedUntil: null,
      expiresAt: new Date(now.getTime() + FORGET_AFTER_MS),
    })
  );
  await Promise.all(docs.map(doc => LoginAttempts.insertAsync(doc)));
};

describe('reserveLoginAttempt', () => {
  it('blocks only the address making the attempts', async () => {
    await useUpAttempts('u1', '1.1.1.1');
    expect(await reserveLoginAttempt('u1', '1.1.1.1')).toBe(false);

    // The account's owner, elsewhere, can still log in.
    expect(await reserveLoginAttempt('u1', '2.2.2.2')).toBe(true);
    // Other accounts from the same address are counted separately.
    expect(await reserveLoginAttempt('u2', '1.1.1.1')).toBe(true);
  });

  it('clears the count after a successful login', async () => {
    await useUpAttempts('u1', '1.1.1.1');
    await clearLoginAttempts('u1', '1.1.1.1');
    expect(await reserveLoginAttempt('u1', '1.1.1.1')).toBe(true);
  });

  it('counts parallel attempts from one address without losing any', async () => {
    const results = await Promise.all(
      Array.from({ length: MAX_FREE_ATTEMPTS + 3 }, () =>
        reserveLoginAttempt('u1', '1.1.1.1')
      )
    );
    expect(results.filter(Boolean)).toHaveLength(MAX_FREE_ATTEMPTS);
  });

  it('lets only trusted addresses try once the account cap is reached', async () => {
    // The owner logged in from home before the attack.
    await clearLoginAttempts('u1', '3.3.3.3');
    await reachAccountCap('u1');

    expect(await reserveLoginAttempt('u1', '9.9.9.9')).toBe(false);
    // A trusted address is still held to its own count.
    await useUpAttempts('u1', '3.3.3.3');
    expect(await reserveLoginAttempt('u1', '3.3.3.3')).toBe(false);
  });

  it('forgets attempts older than the window for the account cap', async () => {
    await reachAccountCap('u1');
    await LoginAttempts.updateAsync(
      { userId: 'u1' },
      {
        $set: {
          lastAttemptAt: new Date(Date.now() - FORGET_AFTER_MS - 1000),
          blockedUntil: null,
        },
      },
      { multi: true }
    );
    expect(await reserveLoginAttempt('u1', '9.9.9.9')).toBe(true);
  });
});

describe('getLoginBlockStatus', () => {
  it('reports blocked addresses and the account cap', async () => {
    expect(await getLoginBlockStatus('u1')).toEqual({
      blockedAddresses: 0,
      untrustedAddressesBlocked: false,
    });

    await useUpAttempts('u1', '1.1.1.1');
    expect(await getLoginBlockStatus('u1')).toEqual({
      blockedAddresses: 1,
      untrustedAddressesBlocked: false,
    });

    await reachAccountCap('u1');
    expect((await getLoginBlockStatus('u1')).untrustedAddressesBlocked).toBe(
      true
    );
  });
});

describe('clearLoginBlocks', () => {
  it('lifts every block, keeps trusted addresses and logs the administrator', async () => {
    await Users.insertAsync({ _id: 'u1', username: 'ali' });
    await clearLoginAttempts('u1', '3.3.3.3');
    await useUpAttempts('u1', '3.3.3.3');
    await reachAccountCap('u1');

    await clearLoginBlocks({ userId: 'u1' }, { _id: 'admin1' }, 'admin');

    expect(await getLoginBlockStatus('u1')).toEqual({
      blockedAddresses: 0,
      untrustedAddressesBlocked: false,
    });
    expect(await reserveLoginAttempt('u1', '9.9.9.9')).toBe(true);
    const home = await LoginAttempts.findOneAsync('u1|3.3.3.3');
    expect(home?.count).toBe(0);
    expect(home?.trustedUntil?.getTime()).toBeGreaterThan(Date.now());

    const logs = await SecurityLogs.find({ userId: 'u1' }).fetchAsync();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      operationType: SecurityOperationType.LOGIN_BLOCKS_CLEARED,
      operationBy: 'admin1',
    });
  });

  it('only lets a super admin clear a super admin', async () => {
    await Users.insertAsync({ _id: 'u1', username: 'ali', isSuperAdmin: true });
    await Users.insertAsync({ _id: 'admin1', username: 'admin' });

    await expect(
      clearLoginBlocks({ userId: 'u1' }, { _id: 'admin1' }, 'admin')
    ).rejects.toThrow('Only a super admin');
  });
});
