import { StockItems } from "meteor/idreesia-common/collections/inventory";

export default {
  ItemWithQuantity: {
    itemTypeName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.formattedName;
    },
  },

  ItemWithQuantityAndPrice: {
    itemTypeName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.formattedName;
    },
  },
};
