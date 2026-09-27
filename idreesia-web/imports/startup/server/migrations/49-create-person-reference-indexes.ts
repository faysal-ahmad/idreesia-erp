import { Migrations } from 'meteor/quave:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

const INDEX_NOT_FOUND_ERROR_CODE = 27;

// Backs the person relation counts shown on the Deleted People and Duplicate
// People pages - every other person reference they count is already indexed.
Migrations.add({
  version: 49,
  async up() {
    const issuanceForms = IssuanceForms.rawCollection();
    await issuanceForms.createIndex({ issuedBy: 1 }, { background: true });
    await issuanceForms.createIndex({ issuedTo: 1 }, { background: true });

    const purchaseForms = PurchaseForms.rawCollection();
    await purchaseForms.createIndex({ receivedBy: 1 }, { background: true });
    await purchaseForms.createIndex({ purchasedBy: 1 }, { background: true });

    const stockAdjustments = StockAdjustments.rawCollection();
    await stockAdjustments.createIndex({ adjustedBy: 1 }, { background: true });

    // Migration 39 moved the user's person reference from karkunId to
    // personId, so the karkunId index created in migration 19 is now unused.
    const users = Users.rawCollection();
    await users.createIndex({ personId: 1 }, { background: true });
    try {
      await users.dropIndex('karkunId_1');
    } catch (error) {
      if ((error as { code?: number }).code !== INDEX_NOT_FOUND_ERROR_CODE) {
        throw error;
      }
    }
  },
});
