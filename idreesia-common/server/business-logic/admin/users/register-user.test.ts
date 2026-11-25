import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Accounts } from 'meteor/accounts-base';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

import { TOO_MANY_ATTEMPTS_MESSAGE } from './login-attempts';
import {
  REGISTRATIONS_PER_WINDOW,
  resetRegistrationLimits,
} from './registration-limit';
import { registerUser } from './register-user';

vi.mock('meteor/accounts-base', () => ({
  Accounts: {
    findUserByEmail: vi.fn(),
    createUserAsync: vi.fn(),
    sendEnrollmentEmail: vi.fn(),
  },
}));

const accounts = Accounts as unknown as {
  findUserByEmail: ReturnType<typeof vi.fn>;
  createUserAsync: ReturnType<typeof vi.fn>;
  sendEnrollmentEmail: ReturnType<typeof vi.fn>;
};

let counter = 0;

beforeEach(() => {
  resetRegistrationLimits();
  counter = 0;
  accounts.findUserByEmail.mockReset().mockResolvedValue(null);
  accounts.sendEnrollmentEmail.mockReset();
  accounts.createUserAsync.mockReset().mockImplementation(async () => {
    counter += 1;
    const _id = `new${counter}`;
    await Users.insertAsync({ _id });
    return _id;
  });
});

describe('registerUser', () => {
  it('creates a locked account with no permissions or super-admin flag', async () => {
    const result = await registerUser(
      { displayName: 'New Person', email: 'a@b.c' },
      '1.1.1.1'
    );
    expect(result).toBe(1);

    const user = await Users.findOneAsync('new1');
    expect(user?.locked).toBe(true);
    expect(user?.permissions).toBeUndefined();
    expect(user?.isSuperAdmin).toBeUndefined();
    expect(accounts.sendEnrollmentEmail).toHaveBeenCalledWith('new1');
  });

  it('refuses an email that is already registered, without creating or emailing', async () => {
    accounts.findUserByEmail.mockResolvedValue({ _id: 'existing' });
    await expect(
      registerUser({ displayName: 'x', email: 'a@b.c' }, '1.1.1.1')
    ).rejects.toThrow('already registered');
    expect(accounts.createUserAsync).not.toHaveBeenCalled();
    expect(accounts.sendEnrollmentEmail).not.toHaveBeenCalled();
  });

  it('is rate limited per client address, before touching accounts', async () => {
    for (let i = 0; i < REGISTRATIONS_PER_WINDOW; i += 1) {
      await registerUser({ displayName: 'x', email: `a${i}@b.c` }, '2.2.2.2');
    }
    accounts.createUserAsync.mockClear();
    await expect(
      registerUser({ displayName: 'x', email: 'z@b.c' }, '2.2.2.2')
    ).rejects.toThrow(TOO_MANY_ATTEMPTS_MESSAGE);
    expect(accounts.createUserAsync).not.toHaveBeenCalled();

    // another address is unaffected
    await expect(
      registerUser({ displayName: 'x', email: 'y@b.c' }, '3.3.3.3')
    ).resolves.toBe(1);
  });

  it('does not send the email when account creation fails', async () => {
    accounts.createUserAsync.mockRejectedValue(new Error('boom'));
    await expect(
      registerUser({ displayName: 'x', email: 'a@b.c' }, '4.4.4.4')
    ).rejects.toThrow('boom');
    expect(accounts.sendEnrollmentEmail).not.toHaveBeenCalled();
  });
});
