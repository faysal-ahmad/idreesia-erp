import { beforeEach, describe, expect, it } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  PhysicalStoreAccess,
  PhysicalStores,
} from 'meteor/idreesia-common/server/collections/inventory';

import { migrateLegacyStoreAccess } from './migrate-legacy-store-access';

const VIEW = Permissions.IN_VIEW_ISSUANCE_FORMS;
const MANAGE = Permissions.IN_MANAGE_ISSUANCE_FORMS;
const PURCHASE = Permissions.IN_VIEW_PURCHASE_FORMS;

let s1: string;
let s2: string;

// The old fields are no longer in the schemas, so they are written straight to
// the database, as they are in production.
// Meteor's typings for raw collections are narrower than the driver.
interface RawCollection {
  insertOne(doc: object): Promise<unknown>;
  findOne(selector: object): Promise<unknown>;
}
const raw = (collection: { rawCollection(): unknown }) =>
  collection.rawCollection() as unknown as RawCollection;

const addUser = async (doc: Record<string, unknown>) => {
  const _id = `u-${Math.random()}`;
  await raw(Users).insertOne({ _id, ...doc });
  return _id;
};
const addGroup = async (doc: Record<string, unknown>) => {
  const _id = `g-${Math.random()}`;
  await raw(UserGroups).insertOne({ _id, name: _id, ...doc });
  return _id;
};

const byStore = <T extends { store: string }>(list: T[]) =>
  [...list].sort((a, b) => a.store.localeCompare(b.store));

const entries = async (subjectId: string) =>
  (await PhysicalStoreAccess.find({ subjectId }).fetchAsync())
    .map(entry => ({
      store: entry.physicalStoreId,
      permissions: [...entry.permissions].sort(),
      subjectType: entry.subjectType,
    }))
    .sort((a, b) => a.store.localeCompare(b.store));

beforeEach(async () => {
  s1 = (await PhysicalStores.insertAsync({ name: 'Store 1' } as never)) as string;
  s2 = (await PhysicalStores.insertAsync({ name: 'Store 2' } as never)) as string;
});

describe('migrateLegacyStoreAccess', () => {
  it('turns a user’s stores and store permissions into one entry per store', async () => {
    const u = await addUser({
      permissions: [VIEW, MANAGE, 'hr-view-karkuns'],
      instances: [s1, s2],
    });
    const report = await migrateLegacyStoreAccess();
    expect(await entries(u)).toEqual(
      byStore([
        { store: s1, permissions: [VIEW, MANAGE].sort(), subjectType: 'user' },
        { store: s2, permissions: [VIEW, MANAGE].sort(), subjectType: 'user' },
      ])
    );
    expect(report).toMatchObject({ usersMigrated: 1, entriesWritten: 2, mismatches: [] });
  });

  it('migrates the effective access, own plus every group, as it worked before', async () => {
    const g1 = await addGroup({ permissions: [PURCHASE], instances: [s2] });
    const g2 = await addGroup({ permissions: ['hr-view-karkuns'] });
    const u = await addUser({
      permissions: [VIEW],
      instances: [s1],
      groups: [g1, g2],
    });
    const member = await addUser({ groups: [g1] });
    const report = await migrateLegacyStoreAccess();

    // Own store s1 + the group's store s2, with the union of permissions.
    expect(await entries(u)).toEqual(
      byStore([
        { store: s1, permissions: [VIEW, PURCHASE].sort(), subjectType: 'user' },
        { store: s2, permissions: [VIEW, PURCHASE].sort(), subjectType: 'user' },
      ])
    );
    // A member with no stores/permissions of their own keeps what the group gave.
    expect(await entries(member)).toEqual([
      { store: s2, permissions: [PURCHASE], subjectType: 'user' },
    ]);
    expect(report.groupsWithStores).toHaveLength(1);
    // The group itself gets no entry: its access is in its members' entries.
    expect(await PhysicalStoreAccess.find({ subjectType: 'group' }).countAsync()).toBe(0);
  });

  it('skips users who never had usable store access and super-admins', async () => {
    await addUser({ permissions: [VIEW] });
    await addUser({ instances: [s1] });
    await addUser({ isSuperAdmin: true, permissions: [VIEW], instances: [s1] });
    const report = await migrateLegacyStoreAccess();
    expect(await PhysicalStoreAccess.find({}).countAsync()).toBe(0);
    expect(report).toMatchObject({
      usersWithoutStores: 1,
      usersWithoutStorePermissions: 1,
    });
  });

  it('skips stores that no longer exist', async () => {
    const u = await addUser({ permissions: [VIEW], instances: [s1, 'deleted'] });
    const report = await migrateLegacyStoreAccess();
    expect((await entries(u)).map(entry => entry.store)).toEqual([s1]);
    expect(report.missingStoreIds).toEqual(['deleted']);
  });

  it('is safe to run again and keeps changes made since', async () => {
    const u = await addUser({ permissions: [VIEW], instances: [s1] });
    await migrateLegacyStoreAccess();
    // An admin gives more on the store in the new screen.
    await PhysicalStoreAccess.updateAsync(
      { subjectId: u },
      { $set: { permissions: [VIEW, MANAGE] } }
    );
    await migrateLegacyStoreAccess();
    expect(await PhysicalStoreAccess.find({ subjectId: u }).countAsync()).toBe(1);
    expect((await entries(u))[0].permissions).toEqual([VIEW, MANAGE].sort());
  });

  it('leaves the old fields in place', async () => {
    const u = await addUser({ permissions: [VIEW], instances: [s1] });
    await migrateLegacyStoreAccess();
    const stored = await raw(Users).findOne({ _id: u });
    expect(stored).toMatchObject({ permissions: [VIEW], instances: [s1] });
  });
});
