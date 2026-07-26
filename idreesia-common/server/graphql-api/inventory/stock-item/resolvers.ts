import type DataLoader from 'dataloader';
import {
  StockItems,
  PurchaseForms,
  IssuanceForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

import { getPagedStockItems, getStatistics } from './queries';
import { mergeStockItems, recalculateStockLevels } from './helpers';

interface StockItem {
  _id: string;
  physicalStoreId: string;
  name?: string;
  company?: string;
  details?: string;
  unitOfMeasurement?: string;
  categoryId?: string;
  minStockLevel?: number;
  currentStockLevel?: number;
  imageId?: string;
}

interface StockItemArgs extends StockItem {
  queryString: string;
  _ids: string[];
  _idToKeep: string;
  _idsToMerge: string[];
}

interface ResolverContext {
  user: {
    _id: string;
  };
  loaders: {
    inventory: {
      itemCategories: DataLoader<string, unknown>;
      physicalStores: DataLoader<string, unknown>;
    };
  };
}

export default {
  StockItem: {
    formattedName: async (stockItem: StockItem) => {
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
      stockItem: StockItem,
      _args: unknown,
      {
        loaders: {
          inventory: { itemCategories },
        },
      }: ResolverContext
    ) => {
      if (!stockItem.categoryId) return null;
      const itemCategory = (await itemCategories.load(stockItem.categoryId)) as
        | { name?: string }
        | undefined;
      return itemCategory?.name;
    },
    purchaseFormsCount: async (stockItem: StockItem) =>
      PurchaseForms.find({
        physicalStoreId: { $eq: stockItem.physicalStoreId },
        items: {
          $elemMatch: {
            stockItemId: { $eq: stockItem._id },
          },
        },
      }).countAsync(),
    issuanceFormsCount: async (stockItem: StockItem) =>
      IssuanceForms.find({
        physicalStoreId: { $eq: stockItem.physicalStoreId },
        items: {
          $elemMatch: {
            stockItemId: { $eq: stockItem._id },
          },
        },
      }).countAsync(),
    stockAdjustmentsCount: async (stockItem: StockItem) =>
      StockAdjustments.find({
        physicalStoreId: { $eq: stockItem.physicalStoreId },
        stockItemId: { $eq: stockItem._id },
      }).countAsync(),
    refPhysicalStore: async (
      stockItem: StockItem,
      _args: unknown,
      {
        loaders: {
          inventory: { physicalStores },
        },
      }: ResolverContext
    ) => {
      return physicalStores.load(stockItem.physicalStoreId);
    },
  },

  Query: {
    pagedStockItems: async (
      _obj: unknown,
      { physicalStoreId, queryString }: StockItemArgs
    ) => {
      return getPagedStockItems(queryString, physicalStoreId);
    },

    stockItemById: async (_obj: unknown, { _id }: Pick<StockItemArgs, '_id'>) => {
      return StockItems.findOneAsync(_id);
    },

    stockItemsById: async (
      _obj: unknown,
      { physicalStoreId, _ids }: Pick<StockItemArgs, 'physicalStoreId' | '_ids'>
    ) => {
      if (!_ids || _ids.length === 0) return [];
      return StockItems.find({
        _id: { $in: _ids },
        physicalStoreId: { $eq: physicalStoreId },
      }).fetchAsync();
    },

    inventoryStatistics: async (
      _obj: unknown,
      { physicalStoreId }: Pick<StockItemArgs, 'physicalStoreId'>
    ) => {
      return getStatistics(physicalStoreId);
    },
  },

  Mutation: {
    createStockItem: async (
      _obj: unknown,
      {
        name,
        company,
        details,
        unitOfMeasurement,
        categoryId,
        physicalStoreId,
        minStockLevel,
        currentStockLevel,
      }: StockItemArgs,
      { user }: ResolverContext
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
      _obj: unknown,
      {
        _id,
        physicalStoreId,
        name,
        company,
        details,
        unitOfMeasurement,
        categoryId,
        minStockLevel,
      }: StockItemArgs,
      { user }: ResolverContext
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

    verifyStockItemLevel: async (
      _obj: unknown,
      { _id, physicalStoreId }: Pick<StockItemArgs, '_id' | 'physicalStoreId'>,
      { user }: ResolverContext
    ) => {
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

    removeStockItem: async (
      _obj: unknown,
      { _id, physicalStoreId }: Pick<StockItemArgs, '_id' | 'physicalStoreId'>
    ) => {
      // Check that there are no purchase/issuance forms, or stock adjustments
      // against this stock item.
      const purchaseFormsCount = await PurchaseForms.find({
        physicalStoreId: { $eq: physicalStoreId },
        items: {
          $elemMatch: {
            stockItemId: { $eq: _id },
          },
        },
      }).countAsync();
      const issuanceFormsCount = await IssuanceForms.find({
        physicalStoreId: { $eq: physicalStoreId },
        items: {
          $elemMatch: {
            stockItemId: { $eq: _id },
          },
        },
      }).countAsync();
      const stockAdjustmentsCount = await StockAdjustments.find({
        physicalStoreId: { $eq: physicalStoreId },
        stockItemId: { $eq: _id },
      }).countAsync();

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
      _obj: unknown,
      { _id, physicalStoreId, imageId }: StockItemArgs,
      { user }: ResolverContext
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
      _obj: unknown,
      { _idToKeep, _idsToMerge, physicalStoreId }: StockItemArgs
    ) => {
      await mergeStockItems(_idToKeep, _idsToMerge, physicalStoreId);
      return StockItems.findOneAsync(_idToKeep);
    },

    recalculateStockLevels: async (
      _obj: unknown,
      { _ids, physicalStoreId }: Pick<StockItemArgs, '_ids' | 'physicalStoreId'>
    ) => {
      for (const id of _ids) {
        await recalculateStockLevels(id, physicalStoreId);
      }

      return StockItems.find({
        _id: { $in: _ids },
        physicalStoreId: { $eq: physicalStoreId },
      }).fetchAsync();
    },
  },
};
