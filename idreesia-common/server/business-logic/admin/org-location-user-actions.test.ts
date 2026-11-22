import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { createChatUser } from 'meteor/idreesia-common/server/chat';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People, SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import {
  createOrgLocationUserChatAccount,
  resetOrgLocationUserPassword,
  setOrgLocationUserLocked,
} from './org-location-user-actions';

vi.mock('meteor/idreesia-common/server/chat', () => ({
  createChatUser: vi.fn(),
}));

const accounts = { setPasswordAsync: vi.fn() };
(globalThis as { Accounts?: unknown }).Accounts = accounts;

type Doc = Record<string, unknown>;
const insert = (collection: { rawCollection(): unknown }, doc: Doc) =>
  (collection.rawCollection() as { insertOne(d: Doc): Promise<unknown> }).insertOne(doc);

const caller = { _id: 'manager' };

beforeEach(async () => {
  accounts.setPasswordAsync.mockReset().mockResolvedValue(undefined);
  (createChatUser as unknown as ReturnType<typeof vi.fn>)
    .mockReset()
    .mockResolvedValue('chat-1');
  await insert(People, {
    _id: 'k1',
    isKarkun: true,
    sharedData: { name: 'Ali' },
    karkunData: { mehfilLocationId: 'm1' },
  });
  await insert(People, {
    _id: 'k2',
    isKarkun: true,
    sharedData: { name: 'Other' },
    karkunData: { mehfilLocationId: 'm2' },
  });
  await insert(Users, {
    _id: 'u1',
    username: 'ali',
    profile: { name: 'Ali' },
    personId: 'k1',
  });
  await insert(Users, { _id: 'u2', username: 'other', personId: 'k2' });
  await insert(Users, {
    _id: 'admin',
    username: 'admin',
    personId: 'k1',
    isSuperAdmin: true,
  });
  await insert(Users, {
    _id: 'bot',
    username: 'bot',
    personId: 'k1',
    isServiceAccount: true,
  });
});

const logTypes = async (userId: string) =>
  (await SecurityLogs.find({ userId }).fetchAsync()).map(log => log.operationType);

describe('actions on the account of a karkun of the location', () => {
  it('resets the password and logs it', async () => {
    await resetOrgLocationUserPassword(
      { locationId: 'm1', userId: 'u1', password: 'secret' },
      caller,
      'test'
    );
    expect(accounts.setPasswordAsync).toHaveBeenCalledWith('u1', 'secret');
    expect(await logTypes('u1')).toEqual([SecurityOperationType.PASSWORD_RESET]);
  });

  it('locks and unlocks, logging each change', async () => {
    const run = (locked: boolean) =>
      setOrgLocationUserLocked({ locationId: 'm1', userId: 'u1', locked }, caller, 'test');
    expect((await run(true))?.locked).toBe(true);
    await run(true); // no change, no second log
    expect((await run(false))?.locked).toBe(false);
    expect(await logTypes('u1')).toEqual([
      SecurityOperationType.ACCOUNT_LOCKED,
      SecurityOperationType.ACCOUNT_UNLOCKED,
    ]);
  });

  it('cannot lock your own account', async () => {
    await expect(
      setOrgLocationUserLocked(
        { locationId: 'm1', userId: 'u1', locked: true },
        { _id: 'u1' },
        'test'
      )
    ).rejects.toThrow('your own account');
  });

  it('creates the chat account', async () => {
    await createOrgLocationUserChatAccount(
      { locationId: 'm1', userId: 'u1' },
      caller,
      'test'
    );
    expect((await Users.findOneAsync('u1'))?.chatUserId).toBe('chat-1');
    expect(await logTypes('u1')).toEqual([SecurityOperationType.CHAT_ACCOUNT_CREATED]);
  });

  it('refuses accounts outside the location, service accounts and super-admins', async () => {
    for (const userId of ['u2', 'bot', 'admin', 'nobody']) {
      await expect(
        resetOrgLocationUserPassword(
          { locationId: 'm1', userId, password: 'x' },
          caller,
          'test'
        )
      ).rejects.toThrow();
      await expect(
        setOrgLocationUserLocked({ locationId: 'm1', userId, locked: true }, caller, 'test')
      ).rejects.toThrow();
      await expect(
        createOrgLocationUserChatAccount({ locationId: 'm1', userId }, caller, 'test')
      ).rejects.toThrow();
    }
    expect(accounts.setPasswordAsync).not.toHaveBeenCalled();
  });
});
