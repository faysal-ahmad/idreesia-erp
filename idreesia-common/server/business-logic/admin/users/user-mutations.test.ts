import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { createChatUser } from 'meteor/idreesia-common/server/chat';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import {
  checkUserAccountAvailability,
  createChatAccount,
  createServiceAccount,
  createUser,
  recordUserLogin,
  resetUserPassword,
  setUserPermissions,
  updateUser,
} from './user-mutations';

vi.mock('meteor/idreesia-common/server/chat', () => ({
  createChatUser: vi.fn(),
}));

const createChat = createChatUser as unknown as ReturnType<typeof vi.fn>;

const caller = { _id: 'admin' };

let counter = 0;

// A stand-in for Meteor's Accounts (a global in the app) that keeps users in
// the Users collection.
const accounts = {
  createUserAsync: vi.fn(),
  findUserByUsername: vi.fn(),
  setPasswordAsync: vi.fn(),
  setUsername: vi.fn(),
};
(globalThis as { Accounts?: unknown }).Accounts = accounts;

beforeEach(() => {
  counter = 0;
  createChat.mockReset().mockResolvedValue('chat-1');
  accounts.createUserAsync.mockReset().mockImplementation(
    async (options: { username?: string; email?: string }) => {
      counter += 1;
      const _id = `new${counter}`;
      await Users.insertAsync({
        _id,
        ...(options.username ? { username: options.username } : {}),
      });
      return _id;
    }
  );
  accounts.findUserByUsername.mockReset().mockImplementation(
    async (username: string) =>
      Users.findOneAsync({ username: new RegExp(`^${username}$`, 'i') }) ?? null
  );
  accounts.setPasswordAsync.mockReset().mockResolvedValue(undefined);
  accounts.setUsername.mockReset().mockImplementation(
    async (userId: string, username: string) => {
      await Users.updateAsync(userId, { $set: { username } });
    }
  );
});

const logsOf = async (userId: string | null) =>
  SecurityLogs.find({ userId }, { sort: { operationTime: 1 } }).fetchAsync();

const logTypes = async (userId: string) =>
  (await logsOf(userId)).map(log => log.operationType);

describe('checkUserAccountAvailability', () => {
  it('reports a taken user name, ignoring case, and a taken email', async () => {
    await Users.insertAsync({
      _id: 'u1',
      username: 'Ali',
      emails: [{ address: 'Ali@Example.com', verified: false }],
    } as never);
    await Users.insertAsync({ _id: 'u2', username: 'bob', email: 'bob@example.com' } as never);

    expect(
      await checkUserAccountAvailability({ userName: 'ali', email: 'ali@example.COM' })
    ).toEqual({
      userNameMessage: "User name 'ali' is already in use.",
      emailMessage: "Email 'ali@example.COM' is already in use.",
    });
    // An email stored on the user itself counts too.
    expect((await checkUserAccountAvailability({ email: 'BOB@example.com' })).emailMessage).toBe(
      "Email 'BOB@example.com' is already in use."
    );
  });

  it('accepts free names, rejects bad ones and skips what is not given', async () => {
    expect(
      await checkUserAccountAvailability({ userName: 'carol', email: 'carol@example.com' })
    ).toEqual({ userNameMessage: null, emailMessage: null });
    expect(
      (await checkUserAccountAvailability({ userName: 'bad name' })).userNameMessage
    ).toContain('may only contain');
    expect(await checkUserAccountAvailability({})).toEqual({
      userNameMessage: null,
      emailMessage: null,
    });
  });
});

describe('createUser', () => {
  it('refuses an email another user already has', async () => {
    await Users.insertAsync({
      _id: 'u1',
      emails: [{ address: 'taken@example.com', verified: false }],
    } as never);

    await expect(
      createUser({ email: 'Taken@example.com' }, caller, 'erp')
    ).rejects.toThrow("Email 'Taken@example.com' is already in use.");
  });

  it('creates an account from a user name and password, with a security log', async () => {
    const created = await createUser(
      {
        userName: '  ali.khan ',
        password: 'secret',
        email: 'a@b.c',
        displayName: 'Ali Khan',
        personId: 'p1',
      },
      caller,
      'test',
      'detail'
    );

    expect(accounts.createUserAsync).toHaveBeenCalledWith({
      username: 'ali.khan',
      password: 'secret',
    });
    expect(created).toMatchObject({
      username: 'ali.khan',
      displayName: 'Ali Khan',
      personId: 'p1',
    });
    const logs = await logsOf(created._id);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      operationType: SecurityOperationType.ACCOUNT_CREATED,
      operationBy: 'admin',
      dataSource: 'test',
      dataSourceDetail: 'detail',
    });
  });

  it('creates an email-only account when there is no password', async () => {
    const created = await createUser(
      { email: 'a@b.c', displayName: 'Ali' },
      caller,
      'test'
    );
    expect(accounts.createUserAsync).toHaveBeenCalledWith({ email: 'a@b.c' });
    expect(created.displayName).toBe('Ali');
  });

  it.each(['bad name', 'ali@khan', 'علی'])(
    'rejects the user name %j',
    async userName => {
      await expect(
        createUser({ userName, password: 'x' }, caller, 'test')
      ).rejects.toThrow('may only contain letters, digits');
      expect(accounts.createUserAsync).not.toHaveBeenCalled();
    }
  );

  it('rejects a user name another user has, ignoring case', async () => {
    await Users.insertAsync({ _id: 'existing', username: 'Ali' });
    await expect(
      createUser({ userName: 'ali', password: 'x' }, caller, 'test')
    ).rejects.toThrow("User name 'ali' is already in use.");
    expect(accounts.createUserAsync).not.toHaveBeenCalled();
  });

  it('rejects a person who already has an account', async () => {
    await Users.insertAsync({ _id: 'existing', personId: 'p1' });
    await expect(
      createUser(
        { userName: 'ali', password: 'x', personId: 'p1' },
        caller,
        'test'
      )
    ).rejects.toThrow('already has a user account');
    expect(accounts.createUserAsync).not.toHaveBeenCalled();
  });

  it('leaves no account behind when the security log cannot be written', async () => {
    vi.spyOn(SecurityLogs, 'insertAsync').mockRejectedValueOnce(
      new Error('boom')
    );
    await expect(
      createUser({ userName: 'ali', password: 'x' }, caller, 'test')
    ).rejects.toThrow('boom');
    expect(await Users.find().countAsync()).toBe(0);
  });
});

describe('updateUser', () => {
  const insertUser = (fields: Record<string, unknown> = {}) =>
    Users.insertAsync({ _id: 'target', ...fields });

  it('saves the display name and email', async () => {
    await insertUser({ emails: [{ address: 'old@b.c' }] });
    const updated = await updateUser(
      { userId: 'target', email: 'new@b.c', displayName: 'New Name' },
      caller,
      'test'
    );
    expect(updated).toMatchObject({ email: 'new@b.c', displayName: 'New Name' });
  });

  it('removes the email when none is given', async () => {
    await insertUser({ emails: [{ address: 'old@b.c' }] });
    const updated = await updateUser(
      { userId: 'target', displayName: 'X' },
      caller,
      'test'
    );
    expect(updated.email).toBeNull();
  });

  it('sets a user name only once', async () => {
    await insertUser();
    await updateUser({ userId: 'target', userName: ' first ' }, caller, 'test');
    expect((await Users.findOneAsync('target'))?.username).toBe('first');

    await updateUser({ userId: 'target', userName: 'second' }, caller, 'test');
    expect((await Users.findOneAsync('target'))?.username).toBe('first');
    expect(accounts.setUsername).toHaveBeenCalledTimes(1);
  });

  it('validates a new user name and refuses one that is taken', async () => {
    await insertUser();
    await Users.insertAsync({ _id: 'other', username: 'taken' });

    await expect(
      updateUser({ userId: 'target', userName: 'bad name' }, caller, 'test')
    ).rejects.toThrow('may only contain letters');
    await expect(
      updateUser({ userId: 'target', userName: 'TAKEN' }, caller, 'test')
    ).rejects.toThrow('already in use');
  });

  it('logs a lock and an unlock', async () => {
    await insertUser();
    await updateUser({ userId: 'target', locked: true }, caller, 'test');
    expect((await Users.findOneAsync('target'))?.locked).toBe(true);
    await updateUser({ userId: 'target', locked: false }, caller, 'test');
    expect((await Users.findOneAsync('target'))?.locked).toBe(false);

    expect(await logTypes('target')).toEqual([
      SecurityOperationType.ACCOUNT_LOCKED,
      SecurityOperationType.ACCOUNT_UNLOCKED,
    ]);
  });

  it('writes no lock log when the lock state is unchanged', async () => {
    await insertUser({ locked: true });
    await updateUser({ userId: 'target', locked: true }, caller, 'test');
    expect(await logTypes('target')).toEqual([]);
  });

  it('refuses to lock the last unlocked super admin', async () => {
    await insertUser({ isSuperAdmin: true });
    await Users.insertAsync({ _id: 'admin', isSuperAdmin: true });

    // admin may lock target, as another unlocked super admin remains
    await updateUser({ userId: 'target', locked: true }, caller, 'test');
    await expect(
      updateUser({ userId: 'admin', locked: true }, caller, 'test')
    ).rejects.toThrow('last super admin');
  });

  it('rolls everything back when a later write fails', async () => {
    await insertUser();
    // The lock log is written first; the user update that follows fails.
    vi.spyOn(Users, 'updateAsync').mockRejectedValueOnce(new Error('boom'));
    await expect(
      updateUser({ userId: 'target', locked: true }, caller, 'test')
    ).rejects.toThrow('boom');
    expect(await logTypes('target')).toEqual([]);
  });
});

describe('createServiceAccount', () => {
  it('creates a flagged account without a password, with a security log', async () => {
    const created = await createServiceAccount(
      { userName: ' robot ', displayName: 'Robot' },
      caller,
      'test'
    );
    expect(accounts.createUserAsync).toHaveBeenCalledWith({ username: 'robot' });
    expect(created).toMatchObject({
      username: 'robot',
      displayName: 'Robot',
      isServiceAccount: true,
    });
    expect(await logTypes(created._id)).toEqual([
      SecurityOperationType.ACCOUNT_CREATED,
    ]);
  });

  it('uses the user name as display name when none is given', async () => {
    const created = await createServiceAccount({ userName: 'bot' }, caller, 'test');
    expect(created.displayName).toBe('bot');
  });

  it('refuses a missing, bad or taken user name', async () => {
    await expect(
      createServiceAccount({ userName: '  ' }, caller, 'test')
    ).rejects.toThrow('user name is required');
    await expect(
      createServiceAccount({ userName: 'bad name' }, caller, 'test')
    ).rejects.toThrow('may only contain');
    await Users.insertAsync({ _id: 'u1', username: 'taken' } as never);
    await expect(
      createServiceAccount({ userName: 'taken' }, caller, 'test')
    ).rejects.toThrow('already in use');
  });
});

describe('resetUserPassword', () => {
  it('sets the password and logs it, when a super admin asks', async () => {
    await Users.insertAsync({ _id: 'admin', isSuperAdmin: true });
    await Users.insertAsync({ _id: 'target' });
    await resetUserPassword(
      { userId: 'target', password: 'new-pw' },
      caller,
      'test'
    );
    expect(accounts.setPasswordAsync).toHaveBeenCalledWith('target', 'new-pw');
    expect(await logTypes('target')).toEqual([
      SecurityOperationType.PASSWORD_RESET,
    ]);
  });

  it('refuses a caller who is not a super admin', async () => {
    await Users.insertAsync({ _id: 'admin' });
    await Users.insertAsync({ _id: 'target' });
    await expect(
      resetUserPassword({ userId: 'target', password: 'x' }, caller, 'test')
    ).rejects.toThrow('super admin');
    expect(accounts.setPasswordAsync).not.toHaveBeenCalled();
  });

  it('refuses an empty password and an unknown user', async () => {
    await Users.insertAsync({ _id: 'admin', isSuperAdmin: true });
    await expect(
      resetUserPassword({ userId: 'target', password: '' }, caller, 'test')
    ).rejects.toThrow('password is required');
    await expect(
      resetUserPassword({ userId: 'nobody', password: 'x' }, caller, 'test')
    ).rejects.toThrow('User not found');
  });
});

describe('setUserPermissions', () => {
  it('saves the permissions and logs what was added and removed', async () => {
    await Users.insertAsync({ _id: 'target', permissions: ['a', 'b'] });
    const updated = await setUserPermissions(
      { userId: 'target', permissions: ['b', 'c'] },
      caller,
      'test'
    );
    expect(updated.permissions).toEqual(['b', 'c']);

    const logs = await logsOf('target');
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      operationType: SecurityOperationType.PERMISSIONS_CHANGED,
      operationBy: 'admin',
      operationDetails: { permissionsAdded: ['c'], permissionsRemoved: ['a'] },
    });
  });

  it('treats a user without permissions as having none', async () => {
    await Users.insertAsync({ _id: 'target' });
    await setUserPermissions(
      { userId: 'target', permissions: ['a'] },
      caller,
      'test'
    );
    expect((await logsOf('target'))[0].operationDetails).toEqual({
      permissionsAdded: ['a'],
      permissionsRemoved: [],
    });
  });

  it('rolls the permissions back when the security log cannot be written', async () => {
    await Users.insertAsync({ _id: 'target', permissions: ['a'] });
    vi.spyOn(SecurityLogs, 'insertAsync').mockRejectedValueOnce(
      new Error('boom')
    );
    await expect(
      setUserPermissions({ userId: 'target', permissions: ['b'] }, caller, 'test')
    ).rejects.toThrow('boom');
    expect((await Users.findOneAsync('target'))?.permissions).toEqual(['a']);
  });
});

describe('createChatAccount', () => {
  it('creates the chat account from the user name, display name and email', async () => {
    await Users.insertAsync({
      _id: 'target',
      username: ' ali ',
      profile: { name: ' Ali Khan ' },
      emails: [{ address: 'a@b.c' }],
    });
    const updated = await createChatAccount({ userId: 'target' }, caller, 'test');

    expect(createChat).toHaveBeenCalledWith({
      username: 'ali',
      name: 'Ali Khan',
      email: 'a@b.c',
    });
    expect(updated.chatUserId).toBe('chat-1');
    expect(await logTypes('target')).toEqual([
      SecurityOperationType.CHAT_ACCOUNT_CREATED,
    ]);
  });

  it('refuses an unknown user, an existing chat account, or missing names', async () => {
    await expect(
      createChatAccount({ userId: 'nobody' }, caller, 'test')
    ).rejects.toThrow('User not found.');

    await Users.insertAsync({
      _id: 'has-chat',
      username: 'a',
      profile: { name: 'A' },
      chatUserId: 'c',
    });
    await expect(
      createChatAccount({ userId: 'has-chat' }, caller, 'test')
    ).rejects.toThrow('already has a chat account');

    await Users.insertAsync({ _id: 'no-name', username: 'b' });
    await expect(
      createChatAccount({ userId: 'no-name' }, caller, 'test')
    ).rejects.toThrow('user name and display name are required');
    expect(createChat).not.toHaveBeenCalled();
  });

  it('does not link the chat account when the security log cannot be written', async () => {
    await Users.insertAsync({
      _id: 'target',
      username: 'a',
      profile: { name: 'A' },
    });
    vi.spyOn(SecurityLogs, 'insertAsync').mockRejectedValueOnce(
      new Error('boom')
    );
    await expect(
      createChatAccount({ userId: 'target' }, caller, 'test')
    ).rejects.toThrow('boom');
    expect((await Users.findOneAsync('target'))?.chatUserId).toBeUndefined();
  });
});

describe('recordUserLogin', () => {
  it('stamps the last login time and logs the login with the same time', async () => {
    await Users.insertAsync({ _id: 'target' });
    await recordUserLogin('target', 'web', 'detail');

    const user = await Users.findOneAsync('target');
    const logs = await logsOf('target');
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      operationType: SecurityOperationType.LOGIN,
      dataSource: 'web',
      dataSourceDetail: 'detail',
    });
    expect(logs[0].operationBy).toBeUndefined();
    expect(user?.lastLoggedInAt).toEqual(logs[0].operationTime);
  });

  it('does not stamp the login time when the log cannot be written', async () => {
    await Users.insertAsync({ _id: 'target' });
    vi.spyOn(SecurityLogs, 'insertAsync').mockRejectedValueOnce(
      new Error('boom')
    );
    await expect(recordUserLogin('target', 'web')).rejects.toThrow('boom');
    expect((await Users.findOneAsync('target'))?.lastLoggedInAt).toBeUndefined();
  });
});
