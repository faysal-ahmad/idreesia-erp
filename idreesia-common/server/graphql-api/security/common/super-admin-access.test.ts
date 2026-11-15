import { describe, expect, it } from 'vitest';

import filterByInstanceAccess from './filter-by-instance-access';
import hasInstanceAccess from './has-instance-access';
import hasOnePermission from './has-one-permission';

const instances = [{ _id: 'i1' }, { _id: 'i2' }];

describe('super admin access', () => {
  it('passes every permission and instance check', () => {
    const user = { isSuperAdmin: true };
    expect(hasOnePermission(user, ['anything'])).toBe(true);
    expect(hasInstanceAccess(user, 'i1')).toBe(true);
    expect(filterByInstanceAccess(user, instances)).toEqual(instances);
  });

  it('gives a locked super admin nothing', () => {
    const user = { isSuperAdmin: true, locked: true };
    expect(hasOnePermission(user, ['anything'])).toBe(false);
    expect(hasInstanceAccess(user, 'i1')).toBe(false);
    expect(filterByInstanceAccess(user, instances)).toEqual([]);
  });

  it('gives the erp-admin user name no special rights without the flag', () => {
    const user = { username: 'erp-admin' };
    expect(hasOnePermission(user, ['anything'])).toBe(false);
    expect(hasInstanceAccess(user, 'i1')).toBe(false);
    expect(filterByInstanceAccess(user, instances)).toEqual([]);
  });
});
