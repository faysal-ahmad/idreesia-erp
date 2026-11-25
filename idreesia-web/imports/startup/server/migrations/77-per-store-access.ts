import { Migrations } from 'meteor/quave:migrations';

import { migrateLegacyStoreAccess } from 'meteor/idreesia-common/server/business-logic/inventory/store-access/migrate-legacy-store-access';

// Store access moves from global (a user's or group's list of stores plus
// global `stores-*` permissions) to per-store entries, where users and user
// groups are given permissions on each store (PhysicalStoreAccess). Each user's
// effective access is carried over as it was, so nobody gains or loses access.
// The old fields (`instances`, the `stores-*` permissions) are left in place for
// a later cleanup migration, so the previous release still works if rolled back.
// Safe to run again.
Migrations.add({
  version: 77,
  async up() {
    const report = await migrateLegacyStoreAccess();
    /* eslint-disable no-console */
    console.log(
      `Store access migrated: ${report.usersMigrated} user(s), ${report.entriesWritten} entr(ies).`
    );
    if (report.usersWithoutStorePermissions > 0) {
      console.warn(
        `${report.usersWithoutStorePermissions} user(s) have stores but no store permission; they had no store access and get none.`
      );
    }
    if (report.usersWithoutStores > 0) {
      console.warn(
        `${report.usersWithoutStores} user(s) have store permissions but no store; they had no store access and get none.`
      );
    }
    if (report.missingStoreIds.length > 0) {
      console.warn(
        `Skipped store ids that no longer exist: ${report.missingStoreIds.join(', ')}`
      );
    }
    if (report.groupsWithStores.length > 0) {
      console.warn(
        `User groups with stores (their members were migrated individually): ${report.groupsWithStores
          .map(group => group.name ?? group.groupId)
          .join(', ')}`
      );
    }
    if (report.mismatches.length > 0) {
      console.error(
        `Store access check failed for: ${report.mismatches.join(', ')}`
      );
      throw new Error('Store access migration verification failed.');
    }
    /* eslint-enable no-console */
  },
});
