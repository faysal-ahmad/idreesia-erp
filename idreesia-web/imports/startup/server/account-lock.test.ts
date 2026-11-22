import { describe, expect, it, vi } from 'vitest';

type Attempt = { allowed: boolean; user?: { locked?: boolean; isServiceAccount?: boolean } };
const hooks = vi.hoisted(() => [] as Array<(attempt: { allowed: boolean; user?: { locked?: boolean; isServiceAccount?: boolean } }) => boolean>);

vi.mock('meteor/accounts-base', () => ({
  Accounts: { validateLoginAttempt: (fn: (a: Attempt) => boolean) => hooks.push(fn) },
}));
(globalThis as unknown as { Meteor: { Error: unknown } }).Meteor.Error = class extends Error {
  constructor(public error: string, reason: string) {
    super(reason);
  }
};

import { ACCOUNT_LOCKED_ERROR, isAccountLocked } from './account-lock';

describe('isAccountLocked', () => {
  it('is true only for locked === true', () => {
    expect(isAccountLocked({ locked: true })).toBe(true);
    for (const u of [{ locked: false }, {}, null, undefined]) {
      expect(isAccountLocked(u)).toBe(false);
    }
  });
});

describe('login validation hook', () => {
  const [hook] = hooks;

  it('is registered', () => {
    expect(hooks).toHaveLength(1);
  });

  it('refuses an otherwise successful login of a locked account', () => {
    expect(() => hook({ allowed: true, user: { locked: true } })).toThrow(/locked/);
    try {
      hook({ allowed: true, user: { locked: true } });
    } catch (e) {
      expect((e as { error: string }).error).toBe(ACCOUNT_LOCKED_ERROR);
    }
  });

  it('refuses an otherwise successful login of a service account', () => {
    expect(() =>
      hook({ allowed: true, user: { isServiceAccount: true } })
    ).toThrow(/service account/);
    expect(hook({ allowed: false, user: { isServiceAccount: true } })).toBe(false);
  });

  it('lets an unlocked login through and leaves a failed login failing quietly', () => {
    expect(hook({ allowed: true, user: {} })).toBe(true);
    // a wrong password for a locked account must not reveal the lock
    expect(hook({ allowed: false, user: { locked: true } })).toBe(false);
  });
});
