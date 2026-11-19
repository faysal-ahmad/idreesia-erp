import { describe, expect, it, vi } from 'vitest';

import { TwoFactorErrorCode } from 'meteor/idreesia-common/constants';

import {
  ACCOUNT_LOCKED_MESSAGE,
  passwordLogin,
  type LoginCandidate,
  type LoginDeps,
} from './password-login';

const baseUser: LoginCandidate = { _id: 'u1', services: { password: {} } };
const twoFactorUser: LoginCandidate = {
  _id: 'u1',
  services: { password: {}, twoFactorAuthentication: { secret: 'S', type: 'otp' } },
};

const makeDeps = (user: LoginCandidate | undefined, overrides: Partial<LoginDeps> = {}) => {
  const deps = {
    findUser: vi.fn(async () => user),
    reserveAttempt: vi.fn(async () => true),
    checkPassword: vi.fn(async () => ({ userId: 'u1' }) as { userId: string; error?: unknown }),
    isTwoFactorEnabled: vi.fn((u: LoginCandidate) => !!u.services?.twoFactorAuthentication),
    consumeTwoFactorCode: vi.fn(async () => true),
    clearAttempts: vi.fn(async () => {}),
    issueToken: vi.fn(async () => ({ token: 'T', tokenExpires: new Date(0) })),
    ...overrides,
  };
  return deps;
};

describe('passwordLogin', () => {
  it('rejects malformed input with 400 before looking anything up', async () => {
    const deps = makeDeps(baseUser);
    for (const input of [{}, { username: 'a' }, { username: 'a', password: 5 }, { password: 'p' }]) {
      expect((await passwordLogin(input, deps)).status).toBe(400);
    }
    expect(deps.findUser).not.toHaveBeenCalled();
  });

  it('looks up by username, or by email when there is no username', async () => {
    const deps = makeDeps(baseUser);
    await passwordLogin({ username: 'a', email: 'e', password: 'p' }, deps);
    expect(deps.findUser).toHaveBeenLastCalledWith({ username: 'a' });
    await passwordLogin({ email: 'e', password: 'p' }, deps);
    expect(deps.findUser).toHaveBeenLastCalledWith({ email: 'e' });
  });

  it('is 401 for an unknown user or one with no password, without counting an attempt', async () => {
    for (const user of [undefined, { _id: 'u1' }, { _id: 'u1', services: {} }]) {
      const deps = makeDeps(user);
      expect((await passwordLogin({ username: 'a', password: 'p' }, deps)).status).toBe(401);
      expect(deps.reserveAttempt).not.toHaveBeenCalled();
    }
  });

  it('is 429 when throttled, before the password is checked', async () => {
    const deps = makeDeps(baseUser, { reserveAttempt: vi.fn(async () => false) });
    const result = await passwordLogin({ username: 'a', password: 'p' }, deps);
    expect(result).toMatchObject({ status: 429, body: { error: 'too-many-attempts' } });
    expect(deps.checkPassword).not.toHaveBeenCalled();
  });

  it('is 401 for a wrong password, and keeps the attempt counted', async () => {
    const deps = makeDeps(baseUser, { checkPassword: vi.fn(async () => ({ userId: 'u1', error: new Error('bad') })) });
    expect((await passwordLogin({ username: 'a', password: 'p' }, deps)).status).toBe(401);
    expect(deps.clearAttempts).not.toHaveBeenCalled();
    expect(deps.issueToken).not.toHaveBeenCalled();
  });

  it('reveals the lock only after a correct password (403), never with a wrong one', async () => {
    const locked = { ...baseUser, locked: true };
    const right = makeDeps(locked);
    expect(await passwordLogin({ username: 'a', password: 'p' }, right)).toEqual({
      status: 403,
      body: { error: ACCOUNT_LOCKED_MESSAGE },
    });
    expect(right.issueToken).not.toHaveBeenCalled();

    const wrong = makeDeps(locked, { checkPassword: vi.fn(async () => ({ userId: 'u1', error: 1 })) });
    expect((await passwordLogin({ username: 'a', password: 'x' }, wrong)).status).toBe(401);
  });

  it('a locked account never gets two-factor consumed or a token', async () => {
    const deps = makeDeps({ ...twoFactorUser, locked: true });
    await passwordLogin({ username: 'a', password: 'p', code: '123456' }, deps);
    expect(deps.consumeTwoFactorCode).not.toHaveBeenCalled();
    expect(deps.issueToken).not.toHaveBeenCalled();
  });

  it('needs a code when two-factor is on', async () => {
    for (const code of [undefined, '', 123456]) {
      const deps = makeDeps(twoFactorUser);
      expect(await passwordLogin({ username: 'a', password: 'p', code }, deps)).toEqual({
        status: 401,
        body: { error: TwoFactorErrorCode.CODE_REQUIRED },
      });
      expect(deps.consumeTwoFactorCode).not.toHaveBeenCalled();
      expect(deps.issueToken).not.toHaveBeenCalled();
    }
  });

  it('refuses an invalid or already used code', async () => {
    const deps = makeDeps(twoFactorUser, { consumeTwoFactorCode: vi.fn(async () => false) });
    expect(await passwordLogin({ username: 'a', password: 'p', code: '000000' }, deps)).toEqual({
      status: 401,
      body: { error: TwoFactorErrorCode.INVALID_CODE },
    });
    expect(deps.clearAttempts).not.toHaveBeenCalled();
    expect(deps.issueToken).not.toHaveBeenCalled();
  });

  it('issues a token, clears the attempts, and consumes the code on success', async () => {
    const deps = makeDeps(twoFactorUser);
    const result = await passwordLogin({ username: 'a', password: 'p', code: '123456' }, deps);
    expect(result).toEqual({ status: 200, body: { userId: 'u1', token: 'T', tokenExpires: new Date(0) } });
    expect(deps.consumeTwoFactorCode).toHaveBeenCalledWith('u1', 'S', '123456');
    expect(deps.clearAttempts).toHaveBeenCalledWith('u1');
  });

  it('does not ask for a code when two-factor is off', async () => {
    const deps = makeDeps(baseUser);
    expect((await passwordLogin({ username: 'a', password: 'p' }, deps)).status).toBe(200);
    expect(deps.consumeTwoFactorCode).not.toHaveBeenCalled();
  });
});
