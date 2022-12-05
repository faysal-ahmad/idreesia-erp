import {
  ItemCategories,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

export default {
  ItemWithQuantity: {
    stockItemName: async item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.formattedName;
    },
    stockItemImageId: async item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.imageId;
    },
    categoryName: async item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      const itemCategory = ItemCategories.findOne(stockItem.categoryId);
      return itemCategory.name;
    },
    unitOfMeasurement: async item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.unitOfMeasurement;
    },
  },

  ItemWithQuantityAndPrice: {
    stockItemName: async item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.formattedName;
    },
    stockItemImageId: async item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.imageId;
    },
    categoryName: async item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      const itemCategory = ItemCategories.findOne(stockItem.categoryId);
      return itemCategory.name;
    },
    unitOfMeasurement: async item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.unitOfMeasurement;
    },
  },
};
