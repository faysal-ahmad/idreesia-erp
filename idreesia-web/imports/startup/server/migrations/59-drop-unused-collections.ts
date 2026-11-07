import { Migrations } from 'meteor/quave:migrations';

import { People } from 'meteor/idreesia-common/server/collections/common';

const NamespaceNotFound = 26;

async function dropIfExists(db: { dropCollection(name: string): Promise<unknown> | void }, name: string) {
  try {
    await db.dropCollection(name);
  } catch (error) {
    if ((error as { code?: number }).code !== NamespaceNotFound) throw error;
  }
}

// Collections nothing in the codebase reads or writes any more. Their classes
// (where there were any) have been removed; older migrations that used them
// are commented out.
Migrations.add({
  version: 59,
  async up() {
    const db = People.rawDatabase();

    // Copies of deleted/replaced attachments - no longer kept, and files now
    // live in object storage.
    await dropIfExists(db, 'common-removed-attachments');

    // Leftovers of the accounts module (see migrations 42 and 43).
    await dropIfExists(db, 'accounts-categories');
    await dropIfExists(db, 'accounts-data-imports');
    await dropIfExists(db, 'accounts-payments-history');

    // Job queues from before agenda (agenda-jobs).
    await dropIfExists(db, 'admin-admin-jobs');
    await dropIfExists(db, 'jobs.jobs');

    // Old security data. Visitors were moved into common-people by
    // migration 38.
    await dropIfExists(db, 'security-shared-residences');
    await dropIfExists(db, 'security-shared-residence-residents');
    await dropIfExists(db, 'security-visitor-mulakaat');
    await dropIfExists(db, 'security-visitor-mulakaats');
    await dropIfExists(db, 'security-visitors');

    // Removed features: item types were merged into stock items by
    // migration 5, and the communication module was removed.
    await dropIfExists(db, 'inventory-item-types');
    await dropIfExists(db, 'communication-messages');
  },
});
