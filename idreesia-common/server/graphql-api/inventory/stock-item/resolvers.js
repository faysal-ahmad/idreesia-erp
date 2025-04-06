import {
  StockItems,
  PurchaseForms,
  IssuanceForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

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
    refPhysicalStore: async (
      stockItem,
      args,
      {
        loaders: {
          inventory: { physicalStores },
        },
      }
    ) => {
      return physicalStores.load(stockItem.physicalStoreId);
    },
  },

  Query: {
    pagedStockItems: async (
      obj,
      { physicalStoreId, queryString },
      { user }
    ) => {
      return getPagedStockItems(queryString, physicalStoreId);
    },

    stockItemById: async (obj, { _id }, { user }) => {
      return StockItems.findOneAsync(_id);
    },

    stockItemsById: async (obj, { physicalStoreId, _ids }, { user }) => {
      if (!_ids || _ids.length === 0) return [];
      return StockItems.find({
        _id: { $in: _ids },
        physicalStoreId: { $eq: physicalStoreId },
      }).fetchAsync();
    },

    inventoryStatistics: async (obj, { physicalStoreId }, { user }) => {
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
        physicalStoreId,
        name,
        company,
        details,
        unitOfMeasurement,
        categoryId,
        minStockLevel,
      },
      { user }
    ) => {
      const date = new Date();
      await StockItems.updateAsync(
        {
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        },
        {
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
        }
      );

      return StockItems.findOneAsync(_id);
    },

    verifyStockItemLevel: async (obj, { _id, physicalStoreId }, { user }) => {
      const date = new Date();
      await StockItems.updateAsync(
        {
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        },
        {
          $set: {
            verifiedOn: date,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return StockItems.findOneAsync(_id);
    },

    removeStockItem: async (obj, { _id, physicalStoreId }, { user }) => {
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
        return StockItems.removeAsync({
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        });
      }

      return 0;
    },

    setStockItemImage: async (
      obj,
      { _id, physicalStoreId, imageId },
      { user }
    ) => {
      const date = new Date();
      await StockItems.updateAsync(
        {
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        },
        {
          $set: {
            imageId,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return StockItems.findOneAsync(_id);
    },

    mergeStockItems: async (
      obj,
      { _idToKeep, _idsToMerge, physicalStoreId },
      { user }
    ) => {
      await mergeStockItems(_idToKeep, _idsToMerge, physicalStoreId);
      return StockItems.findOneAsync(_idToKeep);
    },

    recalculateStockLevels: async (
      obj,
      { _ids, physicalStoreId },
      { user }
    ) => {
      await _ids.reduce(
        (prevPromise, id) =>
          prevPromise.then(() => recalculateStockLevels(id, physicalStoreId)),
        Promise.resolve()
      );

      return StockItems.find({
        _id: { $in: _ids },
        physicalStoreId: { $eq: physicalStoreId },
      }).fetchAsync();
    },
  },
};
