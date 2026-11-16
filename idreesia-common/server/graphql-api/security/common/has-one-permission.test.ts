import { describe, expect, it } from 'vitest';

import {
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import filterByInstanceAccess from './filter-by-instance-access';
import hasInstanceAccess from './has-instance-access';
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

describe('hasInstanceAccess', () => {
  it('denies missing and locked users', () => {
    expect(hasInstanceAccess(undefined, 'i1')).toBe(false);
    expect(
      hasInstanceAccess(makeLockedUser({ instances: ['i1'] }), 'i1')
    ).toBe(false);
    expect(hasInstanceAccess(makeLockedUser({ isSuperAdmin: true }), 'i1')).toBe(
      false
    );
  });

  it('allows super-admin and listed instances only', () => {
    expect(hasInstanceAccess(makeSuperAdmin(), 'i9')).toBe(true);
    const user = makeUser({ instances: ['i1'] });
    expect(hasInstanceAccess(user, 'i1')).toBe(true);
    expect(hasInstanceAccess(user, 'i2')).toBe(false);
    expect(hasInstanceAccess({ username: 'x' }, 'i1')).toBe(false);
  });
});

describe('filterByInstanceAccess', () => {
  const all = [{ _id: 'i1' }, { _id: 'i2' }, { _id: 'i3' }];

  it('returns only the listed instances', () => {
    expect(
      filterByInstanceAccess(makeUser({ instances: ['i1', 'i3'] }), all)
    ).toEqual([{ _id: 'i1' }, { _id: 'i3' }]);
  });

  it('returns nothing for missing, locked, or instance-less users', () => {
    expect(filterByInstanceAccess(undefined, all)).toEqual([]);
    expect(
      filterByInstanceAccess(makeLockedUser({ instances: ['i1'] }), all)
    ).toEqual([]);
    expect(filterByInstanceAccess({ username: 'x' }, all)).toEqual([]);
  });
});
