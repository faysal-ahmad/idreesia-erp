import {
  PhysicalStores,
  ItemCategories,
  ItemTypes,
  StockItems,
} from '/imports/lib/collections/inventory';
import { filterByInstanceAccess, hasInstanceAccess, hasOnePermission } from '/imports/api/security';
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
    allStockItems(obj, params, { userId }) {
      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(userId, physicalStores);
      if (filteredPhysicalStores.length === 0) return [];

      const physicalStoreIds = filteredPhysicalStores.map(physicalStore => physicalStore._id);
      return StockItems.find({
        physicalStoreId: { $in: physicalStoreIds },
      }).fetch();
    },

    pagedStockItems(obj, { queryString }, { userId }) {
      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(userId, physicalStores);
      if (filteredPhysicalStores.length === 0) return [];

      return getStockItems(queryString, filteredPhysicalStores);
    },

    stockItemById(obj, { _id }, { userId }) {
      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(userId, physicalStores);
      if (filteredPhysicalStores.length === 0) return [];
      const physicalStoreIds = physicalStores.map(physicalStore => physicalStore._id);

      return StockItems.findOne({
        _id: { $eq: _id },
        physicalStoreId: { $in: physicalStoreIds },
      });
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

      if (hasInstanceAccess(userId, physicalStoreId) === false) {
        throw new Error('You do not have permission to manage Stock Items in this Physical Store.');
      }

      const date = new Date();
      const stockItemId = StockItems.insert({
        itemTypeId,
        physicalStoreId,
        minStockLevel,
        startingStockLevel: currentStockLevel,
        currentStockLevel,
        totalStockLevel,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return StockItems.findOne(stockItemId);
    },

    updateStockItem(obj, { _id, minStockLevel, totalStockLevel }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])) {
        throw new Error('You do not have permission to manage Stock Items in the System.');
      }

      const existingStockItem = StockItems.findOne(_id);
      if (
        !existingStockItem ||
        hasInstanceAccess(userId, existingStockItem.physicalStoreId) === false
      ) {
        throw new Error('You do not have permission to manage Stock Items in the System.');
      }

      const date = new Date();
      StockItems.update(_id, {
        $set: {
          minStockLevel,
          totalStockLevel,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return StockItems.findOne(_id);
    },
  },
};
