import { describe, expect, it } from 'vitest';

import {
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import { decideApiAccess } from './api-access';

describe('decideApiAccess', () => {
  it('is 401 without a user or for a locked user', () => {
    expect(decideApiAccess(undefined, ['P'])).toEqual({ ok: false, status: 401, error: 'Not authenticated.' });
    expect(decideApiAccess(makeLockedUser({ permissions: ['P'] }), ['P'])).toMatchObject({ ok: false, status: 401 });
    expect(decideApiAccess(makeLockedUser({ isSuperAdmin: true }), ['P'])).toMatchObject({ ok: false, status: 401 });
  });

  it('is 403 without any of the permissions', () => {
    expect(decideApiAccess(makeUser({ permissions: ['Q'] }), ['P'])).toEqual({ ok: false, status: 403, error: 'Not authorized.' });
    expect(decideApiAccess(makeUser(), ['P'])).toMatchObject({ status: 403 });
  });

  it('allows a holder of one permission and a super-admin', () => {
    expect(decideApiAccess(makeUser({ permissions: ['P'] }), ['P', 'Q'])).toEqual({ ok: true });
    expect(decideApiAccess(makeSuperAdmin(), ['P'])).toEqual({ ok: true });
  });
});
