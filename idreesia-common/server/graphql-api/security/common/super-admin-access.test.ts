import { describe, expect, it } from 'vitest';

import hasOnePermission from './has-one-permission';

// Super-admin access to stores is covered with the store access tests
// (business-logic/inventory/store-access).
describe('super admin access', () => {
  it('passes every permission check', () => {
    const user = { isSuperAdmin: true };
    expect(hasOnePermission(user, ['anything'])).toBe(true);
  });

  it('gives a locked super admin nothing', () => {
    const user = { isSuperAdmin: true, locked: true };
    expect(hasOnePermission(user, ['anything'])).toBe(false);
  });

  it('gives the erp-admin user name no special rights without the flag', () => {
    const user = { username: 'erp-admin' };
    expect(hasOnePermission(user, ['anything'])).toBe(false);
  });
});
