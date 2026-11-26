import { describe, expect, it } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';

import { searchPurchasingPermissionHolders } from './karkuns';

const newKarkun = async (name: string) => {
  const _id = `person-${name}-${Math.random()}`;
  await People.insertAsync({ _id, isKarkun: true, sharedData: { name } } as never);
  return _id;
};

const newUser = async (personId: string, fields: Record<string, unknown> = {}) =>
  Users.insertAsync({ username: `u-${personId}`, personId, ...fields } as never);

const namesOf = async () =>
  (await searchPurchasingPermissionHolders({})).data.map((p) => p.name).sort();

describe('searchPurchasingPermissionHolders', () => {
  it('finds karkuns holding a Purchasing permission directly or through a group', async () => {
    const direct = await newKarkun('Direct');
    const viaGroup = await newKarkun('ViaGroup');
    const noPermission = await newKarkun('NoPermission');
    const otherModule = await newKarkun('OtherModule');
    const locked = await newKarkun('Locked');
    const noUser = await newKarkun('NoUser');
    expect(noUser).toBeTruthy();

    await newUser(direct, { permissions: [Permissions.PURCHASING_VIEW_VENDORS] });
    const groupId = await UserGroups.insertAsync({
      name: 'Buyers',
      permissions: [Permissions.PURCHASING_MANAGE_ORDERS],
    } as never);
    await newUser(viaGroup, { groups: [groupId] });
    await newUser(noPermission, { permissions: [] });
    await newUser(otherModule, { permissions: ['admin-view-users-and-groups'] });
    await newUser(locked, { permissions: [Permissions.PURCHASING_VIEW_VENDORS], locked: true });

    expect(await namesOf()).toEqual(['Direct', 'ViaGroup']);
  });

  it('is empty when nobody holds a permission', async () => {
    const a = await newKarkun('Alpha');
    expect(a).toBeTruthy();
    expect(await namesOf()).toEqual([]);
  });
});
