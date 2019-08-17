import { StockItems } from "meteor/idreesia-common/collections/inventory";

export default {
  ItemWithQuantity: {
    stockItemName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.formattedName;
    },
  },

  ItemWithQuantityAndPrice: {
    stockItemName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.formattedName;
    },
  },
};
