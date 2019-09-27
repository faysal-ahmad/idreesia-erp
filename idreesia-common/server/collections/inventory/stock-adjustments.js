import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { StockAdjustment as StockAdjustmentSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class StockAdjustments extends AggregatableCollection {
  constructor(name = 'inventory-stock-adjustments', options = {}) {
    const stockAdjustments = super(name, options);
    stockAdjustments.attachSchema(StockAdjustmentSchema);
    return stockAdjustments;
  }
}

export default new StockAdjustments();
