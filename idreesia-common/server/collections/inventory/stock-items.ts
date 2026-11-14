import { assign } from 'meteor/idreesia-common/utilities/lodash';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { StockItem as StockItemSchema } from 'meteor/idreesia-common/server/schemas/inventory';
import { StockItem as StockItemModel } from 'meteor/idreesia-common/server/models/inventory';

interface StockItemDocument {
  _id?: string;
  currentStockLevel?: number;
  startingStockLevel?: number;
  physicalStoreId?: string;
  imageKey?: string;
  [key: string]: unknown;
}

class StockItems extends AggregatableCollection<StockItemDocument> {
  constructor(name = 'inventory-stock-items', options = {}) {
    super(
      name,
      assign({}, options, {
        transform(doc: StockItemDocument) {
          return new StockItemModel(doc);
        },
      })
    );
    this.attachSchema(StockItemSchema);
  }
}

export default new StockItems();
