import { AggregatableCollection } from 'meteor/idreesia-common/collections';

import { StockItemAdjustment as StockItemAdjustmentSchema } from '../../schemas/inventory';

class StockItemAdjustments extends AggregatableCollection {
  constructor(name = 'inventory-stock-item-adjustments', options = {}) {
    const stockItemAdjustments = super(name, options);
    stockItemAdjustments.attachSchema(StockItemAdjustmentSchema);
    return stockItemAdjustments;
  }
}

export default new StockItemAdjustments();
