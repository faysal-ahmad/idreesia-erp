import { Migrations } from 'meteor/quave:migrations';

import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import { ensurePhysicalStoreAccessIndexes } from 'meteor/idreesia-common/server/business-logic/inventory/store-access';

Migrations.add({
  version: 6,
  name: 'Create stores indexes',
  async up() {
    const stockItems = StockItems.rawCollection();
    await stockItems.createIndex({ name: 'text', company: 'text', details: 'text' });
    await stockItems.createIndex({ categoryId: 1 }, { background: true });
    await stockItems.createIndex({ name: 1 }, { background: false });

    // The person references, counted on the Deleted People and Duplicate
    // People pages.
    const issuanceForms = IssuanceForms.rawCollection();
    await issuanceForms.createIndex({ issuedBy: 1 }, { background: true });
    await issuanceForms.createIndex({ issuedTo: 1 }, { background: true });

    const purchaseForms = PurchaseForms.rawCollection();
    await purchaseForms.createIndex({ receivedBy: 1 }, { background: true });
    await purchaseForms.createIndex({ purchasedBy: 1 }, { background: true });

    await StockAdjustments.rawCollection().createIndex(
      { adjustedBy: 1 },
      { background: true }
    );

    await ensurePhysicalStoreAccessIndexes();
  },
});
