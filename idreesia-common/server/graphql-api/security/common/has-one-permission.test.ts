import { describe, expect, it } from 'vitest';

import {
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import hasOnePermission from './has-one-permission';

describe('hasOnePermission', () => {
  it('denies a missing user', () => {
    expect(hasOnePermission(undefined, ['A'])).toBe(false);
    expect(hasOnePermission(null, ['A'])).toBe(false);
  });

  it('denies a locked user even with the permission or the super-admin flag', () => {
    expect(hasOnePermission(makeLockedUser({ permissions: ['A'] }), ['A'])).toBe(
      false
    );
    expect(
      hasOnePermission(makeLockedUser({ isSuperAdmin: true }), ['A'])
    ).toBe(false);
  });

  it('allows a super-admin for anything, including an empty list', () => {
    expect(hasOnePermission(makeSuperAdmin(), ['A'])).toBe(true);
    expect(hasOnePermission(makeSuperAdmin(), [])).toBe(true);
  });

  it('is any-of: one matching permission is enough', () => {
    const user = makeUser({ permissions: ['B'] });
    expect(hasOnePermission(user, ['A', 'B'])).toBe(true);
    expect(hasOnePermission(user, ['A', 'C'])).toBe(false);
  });

  it('denies a user with no permissions, no permissions array, or an empty list', () => {
    expect(hasOnePermission(makeUser(), ['A'])).toBe(false);
    expect(hasOnePermission({ username: 'x' }, ['A'])).toBe(false);
    expect(hasOnePermission(makeUser({ permissions: ['A'] }), [])).toBe(false);
  });
});
