import { Migrations } from 'meteor/quave:migrations';

import {
  PurchasingInvoices,
  PurchasingOrders,
  PurchasingQuotes,
  PurchasingReceipts,
  PurchasingRequisitions,
} from 'meteor/idreesia-common/server/collections/purchasing';

// Purchasing and Stores are being joined:
//  - a line's purchasing catalog item is now `internalCatalogId` (it was
//    `catalogItemId`), as `externalCatalogId` holds a store's stock item;
//  - requisitions, orders and receipts raised for a store carry `source` and
//    `externalSourceId` (purchasing's own have neither field, so nothing to
//    backfill);
//  - invoices bill each line against an order, so they list `orderIds`.
// Safe to run again.
type LineCollection = {
  rawCollection(): {
    find(filter: object): { toArray(): Promise<{ _id: string; lines?: Record<string, unknown>[] }[]> };
    updateOne(filter: object, update: object): Promise<unknown>;
    createIndex(spec: object, options?: object): Promise<unknown>;
    dropIndex(name: string): Promise<unknown>;
  };
};

async function renameCatalogItemId(collection: LineCollection) {
  const raw = collection.rawCollection();
  const docs = await raw.find({ 'lines.catalogItemId': { $exists: true } }).toArray();
  for (const doc of docs) {
    const lines = (doc.lines ?? []).map(({ catalogItemId, ...rest }) =>
      catalogItemId ? { ...rest, internalCatalogId: catalogItemId } : rest
    );
    await raw.updateOne({ _id: doc._id }, { $set: { lines } });
  }
  try {
    await raw.dropIndex('lines.catalogItemId_1');
  } catch {
    // Already gone.
  }
  await raw.createIndex({ 'lines.internalCatalogId': 1 }, { sparse: true });
}

Migrations.add({
  version: 78,
  async up() {
    await renameCatalogItemId(PurchasingRequisitions as unknown as LineCollection);
    await renameCatalogItemId(PurchasingQuotes as unknown as LineCollection);
    await renameCatalogItemId(PurchasingOrders as unknown as LineCollection);
    await renameCatalogItemId(PurchasingInvoices as unknown as LineCollection);

    // Invoices made before lines were billed per order list their one order.
    await PurchasingInvoices.rawCollection().updateMany(
      { orderId: { $exists: true }, orderIds: { $exists: false } },
      [{ $set: { orderIds: ['$orderId'] } }]
    );

    for (const collection of [
      PurchasingRequisitions,
      PurchasingOrders,
      PurchasingReceipts,
    ]) {
      await collection
        .rawCollection()
        .createIndex({ source: 1, externalSourceId: 1, status: 1 }, { sparse: true });
    }
    await PurchasingInvoices.rawCollection().createIndex({ orderIds: 1 }, { sparse: true });
  },
});
