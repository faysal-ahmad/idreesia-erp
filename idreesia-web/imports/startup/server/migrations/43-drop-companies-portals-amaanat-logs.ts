import { Migrations } from 'meteor/quave:migrations';

import { Companies } from 'meteor/idreesia-common/server/collections/accounts';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';

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
    const db = Companies.rawDatabase();

    await dropIfExists(db, Companies.rawCollection().collectionName);
    await dropIfExists(db, Portals.rawCollection().collectionName);
    await dropIfExists(db, 'accounts-amaanat-logs');
  },
});
