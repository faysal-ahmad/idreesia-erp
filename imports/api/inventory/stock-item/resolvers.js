import {
  PhysicalStores,
  ItemCategories,
  ItemTypes,
  StockItems,
} from '/imports/lib/collections/inventory';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

import getStockItems from './queries';

export default {
  StockItem: {
    itemTypeName: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.name;
    },
    itemTypePicture: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.picture;
    },
    itemCategoryName: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      const itemCategory = ItemCategories.findOne(itemType.itemCategoryId);
      return itemCategory.name;
    },
    unitOfMeasurement: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.unitOfMeasurement;
    },
    physicalStoreName: stockItem => {
      const physicalStore = PhysicalStores.findOne(stockItem.physicalStoreId);
      return physicalStore.name;
    },
  },

  Query: {
    allStockItems() {
      return StockItems.find({}).fetch();
    },
    allStockItemsByPhysicalStore(physicalStoreId) {
      if (physicalStoreId) {
        const stockItems = StockItems.find({
          physicalStoreId: { $eq: physicalStoreId },
        }).fetch();
        return stockItems;
      }

      return [];
    },
    pagedStockItems(obj, { queryString }) {
      return getStockItems(queryString);
    },
    stockItemById(obj, { _id }) {
      return StockItems.findOne(_id);
    },
  },

  Mutation: {
    createStockItem(
      obj,
      { itemTypeId, physicalStoreId, minStockLevel, currentStockLevel, totalStockLevel },
      { userId }
    ) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])) {
        throw new Error('You do not have permission to manage Stock Items in the System.');
      }

      const date = new Date();
      const stockItemId = StockItems.insert({
        itemTypeId,
        physicalStoreId,
        minStockLevel,
        currentStockLevel,
        totalStockLevel,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return StockItems.findOne(stockItemId);
    },

    updateStockItem(obj, { _id, itemTypeId, physicalStoreId, minStockLevel }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])) {
        throw new Error('You do not have permission to manage Stock Items in the System.');
      }

      const date = new Date();
      StockItems.update(_id, {
        $set: {
          itemTypeId,
          physicalStoreId,
          minStockLevel,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return StockItems.findOne(_id);
    },
  },
};
