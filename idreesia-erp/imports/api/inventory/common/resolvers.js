import { ItemTypes, StockItems } from "meteor/idreesia-common/collections/inventory";
import { getItemTypeFormattedName } from "/imports/api/inventory/item-type/helpers";

export default {
  ItemWithQuantity: {
    itemTypeName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return getItemTypeFormattedName(itemType);
    },
  },

  ItemWithQuantityAndPrice: {
    itemTypeName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return getItemTypeFormattedName(itemType);
    },
  },
};
