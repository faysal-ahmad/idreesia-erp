import { AggregatableCollection } from "meteor/idreesia-common/collections";

import { StockAdjustment as StockAdjustmentSchema } from "../../schemas/inventory";

class StockAdjustments extends AggregatableCollection {
  constructor(name = "inventory-stock-adjustments", options = {}) {
    const stockAdjustments = super(name, options);
    stockAdjustments.attachSchema(StockAdjustmentSchema);
    return stockAdjustments;
  }
}

export default new StockAdjustments();
