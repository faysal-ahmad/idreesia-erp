import { Migrations } from 'meteor/quave:migrations';

// Companies, Portals collections were dropped by this migration and their
// classes have since been removed from the codebase.
import { PaymentsHistory } from 'meteor/idreesia-common/server/collections/accounts';

const NamespaceNotFound = 26;

async function dropIfExists(db: { dropCollection(name: string): Promise<unknown> | void }, name: string) {
  try {
    await db.dropCollection(name);
  } catch (error) {
    if ((error as { code?: number }).code !== NamespaceNotFound) throw error;
  }
}

Migrations.add({
  version: 43,
  async up() {
    const db = PaymentsHistory.rawDatabase();

    await dropIfExists(db, 'accounts-companies');
    await dropIfExists(db, 'portals');
    await dropIfExists(db, 'accounts-amaanat-logs');
  },
});
