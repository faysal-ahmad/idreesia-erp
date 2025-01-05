import { Migrations } from 'meteor/percolate:migrations';

import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

Migrations.add({
  version: 41,
  up() {
    const stockItems = StockItems.rawCollection();
    stockItems.createIndex({ name: 1 }, { background: false });
  },
});
