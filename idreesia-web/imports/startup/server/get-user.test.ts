import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';

import { getUser } from './get-user';

vi.mock('meteor/accounts-base', () => ({
  Accounts: {
    validateLoginAttempt: () => {},
    _hashLoginToken: (token: string) =>
      createHash('sha256').update(token).digest('base64'),
    // tokens older than a day are expired
    _tokenExpiration: (when: Date) => new Date(when.getTime() + 24 * 60 * 60 * 1000),
  },
}));

const hash = (t: string) => createHash('sha256').update(t).digest('base64');
const users = (globalThis as unknown as { Meteor: { users: { findOneAsync: ReturnType<typeof vi.fn> } } }).Meteor.users;

const userWithToken = (token: string, when: Date, extra: Record<string, unknown> = {}) => ({
  _id: 'u1',
  services: { resume: { loginTokens: [{ hashedToken: hash(token), when }] } },
  ...extra,
});

beforeEach(() => {
  vi.restoreAllMocks();
});

const returning = (user: unknown) =>
  vi.spyOn(users, 'findOneAsync').mockResolvedValue(user as never);

describe('getUser', () => {
  it('is undefined without a token, without touching the database', async () => {
    const spy = returning(undefined);
    expect(await getUser(undefined)).toBeUndefined();
    expect(await getUser('')).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
  });

  it('looks the user up by the hashed token, never the raw one', async () => {
    const spy = returning(undefined);
    await getUser('secret');
    expect(spy).toHaveBeenCalledWith({ 'services.resume.loginTokens.hashedToken': hash('secret') });
  });

  it('is undefined for an unknown token', async () => {
    returning(undefined);
    expect(await getUser('nope')).toBeUndefined();
  });

  it('returns the user for a valid, fresh token', async () => {
    const user = userWithToken('t', new Date());
    returning(user);
    expect(await getUser('t')).toBe(user);
  });

  it('is undefined for an expired token', async () => {
    returning(userWithToken('t', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)));
    expect(await getUser('t')).toBeUndefined();
  });

  it('is undefined when the matched user has no such token entry', async () => {
    returning(userWithToken('other', new Date()));
    expect(await getUser('t')).toBeUndefined();
  });

  it('is undefined for a locked user, even with a valid token', async () => {
    returning(userWithToken('t', new Date(), { locked: true }));
    expect(await getUser('t')).toBeUndefined();
  });

  it('does not treat locked: false as locked', async () => {
    returning(userWithToken('t', new Date(), { locked: false }));
    expect(await getUser('t')).toBeDefined();
  });
});
