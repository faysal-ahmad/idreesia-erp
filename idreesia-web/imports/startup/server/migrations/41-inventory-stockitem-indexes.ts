import { Migrations } from 'meteor/quave:migrations';

import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

Migrations.add({
  version: 41,
  async up() {
    const stockItems = StockItems.rawCollection();
    await stockItems.createIndex({ name: 1 }, { background: false });
  },
});
