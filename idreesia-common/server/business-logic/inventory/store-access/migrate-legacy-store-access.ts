import { StorePermissionValues } from 'meteor/idreesia-common/constants/stores-permissions';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  PhysicalStoreAccess,
  PhysicalStores,
} from 'meteor/idreesia-common/server/collections/inventory';

import { ensurePhysicalStoreAccessIndexes } from './store-access';

// Store access used to be global: a user (or user group) had a list of store
// ids (`instances`) and global `stores-*` permissions, and the effective access
// was the union of the user's own and their groups' values, applied to every
// store in the union. This moves it to per-store entries (PhysicalStoreAccess).
//
// Each user is migrated from their *effective* access, so the new entries give
// exactly the same people exactly the same access as before, with no change in
// who can do what. The groups' own entries are not copied: their access is
// already part of each member's entries. The old fields are left in place.
//
// Safe to run again: entries are merged with what is already there.

interface LegacyAccessHolder {
  _id?: string;
  permissions?: string[];
  instances?: string[];
  groups?: string[];
  isSuperAdmin?: boolean;
}

export interface LegacyStoreAccessReport {
  /** Users given at least one per-store entry. */
  usersMigrated: number;
  /** Per-store entries written (one per user and store). */
  entriesWritten: number;
  /** Users with stores but no store permission: no access before, none now. */
  usersWithoutStorePermissions: number;
  /** Users with store permissions but no store: no access before, none now. */
  usersWithoutStores: number;
  /** Store ids that no longer exist; skipped. */
  missingStoreIds: string[];
  /** Groups that list stores: noted so they can be reassigned if needed. */
  groupsWithStores: Array<{ groupId: string; name?: string }>;
  /** Users whose new access differs from their old effective access. */
  mismatches: string[];
}

const union = (...lists: Array<string[] | undefined>) => [
  ...new Set(lists.flatMap(list => list ?? [])),
];

export async function migrateLegacyStoreAccess(): Promise<LegacyStoreAccessReport> {
  await ensurePhysicalStoreAccessIndexes();

  const report: LegacyStoreAccessReport = {
    usersMigrated: 0,
    entriesWritten: 0,
    usersWithoutStorePermissions: 0,
    usersWithoutStores: 0,
    missingStoreIds: [],
    groupsWithStores: [],
    mismatches: [],
  };

  const stores = await PhysicalStores.find({}).fetchAsync();
  const storeIds = new Set(stores.map(store => store._id as string));

  const groups = (await UserGroups.find({}).fetchAsync()) as Array<
    LegacyAccessHolder & { name?: string }
  >;
  const groupById = new Map(groups.map(group => [group._id as string, group]));
  groups.forEach(group => {
    if ((group.instances ?? []).length > 0) {
      report.groupsWithStores.push({
        groupId: group._id as string,
        name: group.name,
      });
    }
  });

  const missing = new Set<string>();
  const users = (await Users.find({}).fetchAsync()) as LegacyAccessHolder[];
  for (const user of users) {
    // A super-admin may do everything on every store anyway.
    if (!user.isSuperAdmin) {
      const memberGroups = (user.groups ?? []).flatMap(id => {
        const group = groupById.get(id);
        return group ? [group] : [];
      });
      const permissions = union(
        user.permissions,
        ...memberGroups.map(group => group.permissions)
      ).filter(permission => StorePermissionValues.includes(permission));
      const instances = union(
        user.instances,
        ...memberGroups.map(group => group.instances)
      );

      if (instances.length === 0 && permissions.length > 0) {
        report.usersWithoutStores += 1;
      } else if (permissions.length === 0 && instances.length > 0) {
        report.usersWithoutStorePermissions += 1;
      } else if (permissions.length > 0) {
        const targets = instances.filter(id => {
          if (storeIds.has(id)) return true;
          missing.add(id);
          return false;
        });

        for (const physicalStoreId of targets) {
          const selector = {
            physicalStoreId,
            subjectType: 'user' as const,
            subjectId: user._id as string,
          };
          const existing = await PhysicalStoreAccess.findOneAsync(selector);
          const now = new Date();
          if (!existing) {
            await PhysicalStoreAccess.insertAsync({
              ...selector,
              permissions,
              createdAt: now,
              updatedAt: now,
            });
          } else {
            await PhysicalStoreAccess.updateAsync(
              { _id: existing._id },
              {
                $set: {
                  permissions: union(existing.permissions, permissions),
                  updatedAt: now,
                },
              }
            );
          }
          report.entriesWritten += 1;
        }

        // The user's new access must contain the old effective access.
        for (const physicalStoreId of targets) {
          const entry = await PhysicalStoreAccess.findOneAsync({
            physicalStoreId,
            subjectType: 'user',
            subjectId: user._id as string,
          });
          if (!entry || permissions.some(p => !entry.permissions.includes(p))) {
            report.mismatches.push(`${user._id}:${physicalStoreId}`);
          }
        }
        if (targets.length > 0) report.usersMigrated += 1;
      }
    }
  }

  report.missingStoreIds = [...missing];
  return report;
}
