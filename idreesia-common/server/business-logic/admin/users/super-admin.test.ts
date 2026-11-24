import { describe, expect, it } from 'vitest';

import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import { resetTwoFactor } from './two-factor';
import {
  setUserPermissions,
  updateUser,
} from './user-mutations';
import { isSuperAdmin, setSuperAdmin } from './super-admin';

const TWO_FACTOR = {
  services: { twoFactorAuthentication: { secret: 'SECRET', type: 'otp' } },
};

const insertUser = async (_id: string, fields: Record<string, unknown> = {}) => {
  await Users.insertAsync({ _id, username: _id, ...fields });
  return { _id };
};

const flagOf = async (userId: string) =>
  (await Users.findOneAsync(userId))?.isSuperAdmin;

const logTypes = async (userId: string) =>
  (await SecurityLogs.find({ userId }).fetchAsync()).map(
    log => log.operationType
  );

describe('isSuperAdmin', () => {
  it('needs the flag and an unlocked account', () => {
    expect(isSuperAdmin({ isSuperAdmin: true })).toBe(true);
    expect(isSuperAdmin({ isSuperAdmin: true, locked: true })).toBe(false);
    expect(isSuperAdmin({})).toBe(false);
    expect(isSuperAdmin(null)).toBe(false);
  });
});

describe('setSuperAdmin', () => {
  it('only lets a super admin grant the flag', async () => {
    const caller = await insertUser('caller');
    await insertUser('target', TWO_FACTOR);

    await expect(
      setSuperAdmin({ userId: 'target', isSuperAdmin: true }, caller, 'test')
    ).rejects.toThrow('Only a super admin');
    expect(await flagOf('target')).toBeUndefined();
  });

  it('does not accept a locked super admin as the caller', async () => {
    const caller = await insertUser('caller', { isSuperAdmin: true, locked: true });
    await insertUser('target', TWO_FACTOR);

    await expect(
      setSuperAdmin({ userId: 'target', isSuperAdmin: true }, caller, 'test')
    ).rejects.toThrow('Only a super admin');
  });

  it('requires two-factor on the user being made a super admin', async () => {
    const caller = await insertUser('caller', { isSuperAdmin: true });
    await insertUser('target');

    await expect(
      setSuperAdmin({ userId: 'target', isSuperAdmin: true }, caller, 'test')
    ).rejects.toThrow('Two-factor authentication must be enabled');
    expect(await flagOf('target')).toBeUndefined();
  });

  it('refuses a locked user', async () => {
    const caller = await insertUser('caller', { isSuperAdmin: true });
    await insertUser('target', { ...TWO_FACTOR, locked: true });

    await expect(
      setSuperAdmin({ userId: 'target', isSuperAdmin: true }, caller, 'test')
    ).rejects.toThrow('locked user');
  });

  it('grants and revokes the flag, with security logs', async () => {
    const caller = await insertUser('caller', { isSuperAdmin: true });
    await insertUser('target', TWO_FACTOR);

    const granted = await setSuperAdmin(
      { userId: 'target', isSuperAdmin: true },
      caller,
      'test'
    );
    expect(granted.isSuperAdmin).toBe(true);
    expect(await flagOf('target')).toBe(true);

    await setSuperAdmin({ userId: 'target', isSuperAdmin: false }, caller, 'test');
    expect(await flagOf('target')).toBeUndefined();

    expect(await logTypes('target')).toEqual([
      SecurityOperationType.SUPER_ADMIN_GRANTED,
      SecurityOperationType.SUPER_ADMIN_REVOKED,
    ]);
  });

  it('does not check two-factor when revoking', async () => {
    const caller = await insertUser('caller', { isSuperAdmin: true });
    await insertUser('target', { isSuperAdmin: true });

    await setSuperAdmin({ userId: 'target', isSuperAdmin: false }, caller, 'test');
    expect(await flagOf('target')).toBeUndefined();
  });

  it('refuses to revoke the last unlocked super admin', async () => {
    const caller = await insertUser('caller', { isSuperAdmin: true });
    await insertUser('other', { isSuperAdmin: true, locked: true });

    await expect(
      setSuperAdmin({ userId: 'caller', isSuperAdmin: false }, caller, 'test')
    ).rejects.toThrow('last super admin');
    expect(await flagOf('caller')).toBe(true);
  });
});

describe('super admin accounts', () => {
  it('cannot be changed by a user who is not a super admin', async () => {
    const manager = await insertUser('manager');
    await insertUser('admin', { ...TWO_FACTOR, isSuperAdmin: true });

    await expect(
      updateUser({ userId: 'admin', password: 'new-password' }, manager, 'test')
    ).rejects.toThrow('Only a super admin');
    await expect(
      updateUser({ userId: 'admin', locked: true }, manager, 'test')
    ).rejects.toThrow('Only a super admin');
    await expect(
      resetTwoFactor({ userId: 'admin' }, manager, 'test')
    ).rejects.toThrow('Only a super admin');
    await expect(
      setUserPermissions({ userId: 'admin', permissions: [] }, manager, 'test')
    ).rejects.toThrow('Only a super admin');

    expect(
      (await Users.findOneAsync('admin'))?.services?.twoFactorAuthentication
    ).toBeDefined();
  });

  it('can be changed by another super admin', async () => {
    const caller = await insertUser('caller', { isSuperAdmin: true });
    await insertUser('admin', { ...TWO_FACTOR, isSuperAdmin: true });

    await resetTwoFactor({ userId: 'admin' }, caller, 'test');
    expect(
      (await Users.findOneAsync('admin'))?.services?.twoFactorAuthentication
    ).toBeUndefined();
  });

  it('cannot lock the last unlocked super admin', async () => {
    const caller = await insertUser('caller', { isSuperAdmin: true });

    await expect(
      updateUser({ userId: 'caller', locked: true }, caller, 'test')
    ).rejects.toThrow('last super admin');
  });

  it('ignores permission writes for a super admin', async () => {
    const caller = await insertUser('caller', { isSuperAdmin: true });
    await insertUser('admin', { isSuperAdmin: true, permissions: ['a'] });

    await setUserPermissions(
      { userId: 'admin', permissions: ['a', 'b', 'c'] },
      caller,
      'test'
    );
    expect((await Users.findOneAsync('admin'))?.permissions).toEqual(['a']);
    expect(await logTypes('admin')).toEqual([]);
  });

  it('leaves other users manageable without super admin rights', async () => {
    const manager = await insertUser('manager');
    await insertUser('plain');

    await setUserPermissions(
      { userId: 'plain', permissions: ['a'] },
      manager,
      'test'
    );
    expect((await Users.findOneAsync('plain'))?.permissions).toEqual(['a']);
  });
});
