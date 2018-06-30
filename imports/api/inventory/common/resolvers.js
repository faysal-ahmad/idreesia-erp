import { ItemTypes, StockItems } from '/imports/lib/collections/inventory';

export default {
  ItemWithQuantity: {
    itemTypeName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.name;
    },
  },

  ItemWithQuantityAndPrice: {
    itemTypeName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.name;
    },
  },
};
