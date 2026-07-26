import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { StockAdjustment as StockAdjustmentSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class StockAdjustments extends AggregatableCollection {
  constructor(name = 'inventory-stock-adjustments', options = {}) {
    super(name, options);
    this.attachSchema(StockAdjustmentSchema);
  }
}

export default new StockAdjustments();
