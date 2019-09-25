import {
  ItemCategories,
  StockItems,
} from 'meteor/idreesia-common/collections/inventory';

export default {
  ItemWithQuantity: {
    stockItemName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.formattedName;
    },
    stockItemImageId: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.imageId;
    },
    categoryName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      const itemCategory = ItemCategories.findOne(stockItem.categoryId);
      return itemCategory.name;
    },
    unitOfMeasurement: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.unitOfMeasurement;
    },
  },

  ItemWithQuantityAndPrice: {
    stockItemName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.formattedName;
    },
    stockItemImageId: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.imageId;
    },
    categoryName: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      const itemCategory = ItemCategories.findOne(stockItem.categoryId);
      return itemCategory.name;
    },
    unitOfMeasurement: item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      return stockItem.unitOfMeasurement;
    },
  },
};
