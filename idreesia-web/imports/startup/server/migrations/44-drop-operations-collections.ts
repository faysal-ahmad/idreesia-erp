import { Migrations } from 'meteor/quave:migrations';

// ImdadReasons and ImdadRequests collections were dropped by this migration
// and their classes have since been removed from the codebase.
import { People } from 'meteor/idreesia-common/server/collections/common';

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
    const db = People.rawDatabase();

    await dropIfExists(db, 'imdad-imdad-reasons');
    await dropIfExists(db, 'imdad-imdad-requests');
    await dropIfExists(db, 'wazaif-management-wazaif');
    await dropIfExists(db, 'wazaif-management-delivery-orders');
    await dropIfExists(db, 'wazaif-management-printing-orders');
    await dropIfExists(db, 'wazaif-management-stock-adjustments');
    await dropIfExists(db, 'wazaif-management-vendors');
  },
});
