import {
  ItemCategories,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

export default {
  ItemWithQuantity: {
    stockItemName: async item => {
      const stockItem = await StockItems.findOneAsync(item.stockItemId);
      return stockItem.formattedName;
    },
    stockItemImageId: async item => {
      const stockItem = await StockItems.findOneAsync(item.stockItemId);
      return stockItem.imageId;
    },
    categoryName: async item => {
      const stockItem = await StockItems.findOneAsync(item.stockItemId);
      const itemCategory = await ItemCategories.findOneAsync(
        stockItem.categoryId
      );
      return itemCategory.name;
    },
    unitOfMeasurement: async item => {
      const stockItem = await StockItems.findOneAsync(item.stockItemId);
      return stockItem.unitOfMeasurement;
    },
  },

  ItemWithQuantityAndPrice: {
    stockItemName: async item => {
      const stockItem = await StockItems.findOneAsync(item.stockItemId);
      return stockItem.formattedName;
    },
    stockItemImageId: async item => {
      const stockItem = await StockItems.findOneAsync(item.stockItemId);
      return stockItem.imageId;
    },
    categoryName: async item => {
      const stockItem = await StockItems.findOneAsync(item.stockItemId);
      const itemCategory = await ItemCategories.findOneAsync(
        stockItem.categoryId
      );
      return itemCategory.name;
    },
    unitOfMeasurement: async item => {
      const stockItem = await StockItems.findOneAsync(item.stockItemId);
      return stockItem.unitOfMeasurement;
    },
  },
};
