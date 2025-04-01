import {
  StockItems,
  PurchaseForms,
  IssuanceForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getPagedStockItems, getStatistics } from './queries';
import { mergeStockItems, recalculateStockLevels } from './helpers';

export default {
  StockItem: {
    formattedName: async stockItem => {
      const { name, company, details } = stockItem;
      let formattedName = name;
      if (company) {
        formattedName = `${formattedName} - ${company}`;
      }
      if (details) {
        formattedName = `${formattedName} - ${details}`;
      }
      return formattedName;
    },
    categoryName: async (
      stockItem,
      args,
      {
        loaders: {
          inventory: { itemCategories },
        },
      }
    ) => {
      const itemCategory = await itemCategories.load(stockItem.categoryId);
      return itemCategory.name;
    },
    purchaseFormsCount: async stockItem =>
      PurchaseForms.find({
        physicalStoreId: { $eq: stockItem.physicalStoreId },
        items: {
          $elemMatch: {
            stockItemId: { $eq: stockItem._id },
          },
        },
      }).count(),
    issuanceFormsCount: async stockItem =>
      IssuanceForms.find({
        physicalStoreId: { $eq: stockItem.physicalStoreId },
        items: {
          $elemMatch: {
            stockItemId: { $eq: stockItem._id },
          },
        },
      }).count(),
    stockAdjustmentsCount: async stockItem =>
      StockAdjustments.find({
        physicalStoreId: { $eq: stockItem.physicalStoreId },
        stockItemId: { $eq: stockItem._id },
      }).count(),
  },

  Query: {
    pagedStockItems: async (
      obj,
      { physicalStoreId, queryString },
      { user }
    ) => {
      if (hasInstanceAccess(user, physicalStoreId) === false) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getPagedStockItems(queryString, physicalStoreId);
    },

    stockItemById: async (obj, { _id }, { user }) => {
      const stockItem = await StockItems.findOneAsync(_id);
      if (hasInstanceAccess(user, stockItem.physicalStoreId) === false) {
        return null;
      }
      return stockItem;
    },

    stockItemsById: async (obj, { physicalStoreId, _ids }, { user }) => {
      if (!_ids || _ids.length === 0) return [];
      if (hasInstanceAccess(user, physicalStoreId) === false) return [];

      return StockItems.find({
        _id: { $in: _ids },
        physicalStoreId: { $eq: physicalStoreId },
      }).fetchAsync();
    },

    statistics: async (obj, { physicalStoreId }, { user }) => {
      if (hasInstanceAccess(user, physicalStoreId) === false) return null;
      return getStatistics(physicalStoreId);
    },
  },

  Mutation: {
    createStockItem: async (
      obj,
      {
        name,
        company,
        details,
        unitOfMeasurement,
        categoryId,
        physicalStoreId,
        minStockLevel,
        currentStockLevel,
      },
      { user }
    ) => {
      if (
        !hasOnePermission(user, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])
      ) {
        throw new Error(
          'You do not have permission to manage Stock Items in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Stock Items in this Physical Store.'
        );
      }

      const date = new Date();
      const stockItemId = await StockItems.insertAsync({
        name,
        company,
        details,
        unitOfMeasurement,
        categoryId,
        physicalStoreId,
        minStockLevel,
        startingStockLevel: currentStockLevel,
        currentStockLevel,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return StockItems.findOneAsync(stockItemId);
    },

    updateStockItem: async (
      obj,
      {
        _id,
        name,
        company,
        details,
        unitOfMeasurement,
        categoryId,
        minStockLevel,
      },
      { user }
    ) => {
      if (
        !hasOnePermission(user, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])
      ) {
        throw new Error(
          'You do not have permission to manage Stock Items in the System.'
        );
      }

      const existingStockItem = await StockItems.findOneAsync(_id);
      if (
        !existingStockItem ||
        hasInstanceAccess(user, existingStockItem.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Stock Items in the System.'
        );
      }

      const date = new Date();
      await StockItems.updateAsync(_id, {
        $set: {
          name,
          company,
          details,
          unitOfMeasurement,
          categoryId,
          minStockLevel,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return StockItems.findOneAsync(_id);
    },

    verifyStockItemLevel: async (obj, { _id, physicalStoreId }, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])
      ) {
        throw new Error(
          'You do not have permission to manage Stock Items in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Stock Items in this Physical Store.'
        );
      }

      const date = new Date();
      await StockItems.updateAsync(_id, {
        $set: {
          verifiedOn: date,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return StockItems.findOneAsync(_id);
    },

    removeStockItem: async (obj, { _id, physicalStoreId }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.IN_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to manage Stock Items in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Stock Items in this Physical Store.'
        );
      }

      // Check that there are no purchase/issuance forms, or stock adjustments
      // against this stock item.
      const purchaseFormsCount = PurchaseForms.find({
        physicalStoreId: { $eq: physicalStoreId },
        items: {
          $elemMatch: {
            stockItemId: { $eq: _id },
          },
        },
      }).count();
      const issuanceFormsCount = IssuanceForms.find({
        physicalStoreId: { $eq: physicalStoreId },
        items: {
          $elemMatch: {
            stockItemId: { $eq: _id },
          },
        },
      }).count();
      const stockAdjustmentsCount = StockAdjustments.find({
        physicalStoreId: { $eq: physicalStoreId },
        stockItemId: { $eq: _id },
      }).count();

      if (
        purchaseFormsCount + issuanceFormsCount + stockAdjustmentsCount ===
        0
      ) {
        return StockItems.removeAsync(_id);
      }

      return 0;
    },

    setStockItemImage: async (obj, { _id, imageId }, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])
      ) {
        throw new Error(
          'You do not have permission to manage Stock Items in the System.'
        );
      }

      const date = new Date();
      await StockItems.updateAsync(_id, {
        $set: {
          imageId,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return StockItems.findOneAsync(_id);
    },

    mergeStockItems: async (obj, { ids, physicalStoreId }, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])
      ) {
        throw new Error(
          'You do not have permission to manage Stock Items in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Stock Items in this Physical Store.'
        );
      }

      await mergeStockItems(ids, physicalStoreId);
      return StockItems.findOneAsync(ids[0]);
    },

    recalculateStockLevels: async (obj, { ids, physicalStoreId }, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])
      ) {
        throw new Error(
          'You do not have permission to manage Stock Items in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Stock Items in this Physical Store.'
        );
      }

      await ids.reduce(
        (prevPromise, id) =>
          prevPromise.then(() => recalculateStockLevels(id, physicalStoreId)),
        Promise.resolve()
      );

      return StockItems.find({
        _id: { $in: ids },
        physicalStoreId: { $eq: physicalStoreId },
      }).fetchAsync();
    },
  },
};
