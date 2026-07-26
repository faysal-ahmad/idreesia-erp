import { Migrations } from 'meteor/percolate:migrations';

import { ImdadReasons, ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';

const NamespaceNotFound = 26;

async function dropIfExists(db: { dropCollection(name: string): Promise<unknown> | void }, name: string) {
  try {
    await db.dropCollection(name);
  } catch (error) {
    if ((error as { code?: number }).code !== NamespaceNotFound) throw error;
  }
}

Migrations.add({
  version: 44,
  async up() {
    const db = ImdadRequests.rawDatabase();

    await dropIfExists(db, ImdadReasons.rawCollection().collectionName);
    await dropIfExists(db, ImdadRequests.rawCollection().collectionName);
    await dropIfExists(db, 'wazaif-management-wazaif');
    await dropIfExists(db, 'wazaif-management-delivery-orders');
    await dropIfExists(db, 'wazaif-management-printing-orders');
    await dropIfExists(db, 'wazaif-management-stock-adjustments');
    await dropIfExists(db, 'wazaif-management-vendors');
  },
});
