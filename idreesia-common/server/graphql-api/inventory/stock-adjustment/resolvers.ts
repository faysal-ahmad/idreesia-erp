import type DataLoader from 'dataloader';
import { StockAdjustments } from 'meteor/idreesia-common/server/collections/inventory';
import {
  createStockAdjustment,
  removeStockAdjustments,
  updateStockAdjustment,
} from 'meteor/idreesia-common/server/business-logic/inventory/stock-adjustments';

import getStockAdjustments, {
  getStockAdjustmentsByStockItemId,
} from 'meteor/idreesia-common/server/business-logic/inventory/stock-adjustment-search';

interface StockAdjustment {
  _id: string;
  physicalStoreId: string;
  stockItemId: string;
  adjustmentDate?: Date;
  adjustedBy: string;
  quantity: number;
  isInflow?: boolean;
  adjustmentReason?: string;
}

interface StockAdjustmentArgs extends StockAdjustment {
  queryString: string;
  _ids: string[];
}

interface ResolverContext {
  user: {
    _id: string;
  };
  loaders: {
    common: {
      people: DataLoader<string, unknown>;
    };
    inventory: {
      stockItems: DataLoader<string, unknown>;
      physicalStores: DataLoader<string, unknown>;
    };
  };
}

export default {
  StockAdjustment: {
    refStockItem: async (
      stockAdjustment: StockAdjustment,
      _args: unknown,
      {
        loaders: {
          inventory: { stockItems },
        },
      }: ResolverContext
    ) => stockItems.load(stockAdjustment.stockItemId),
    refAdjustedBy: async (
      stockAdjustment: StockAdjustment,
      _args: unknown,
      {
        loaders: {
          common: { people },
        },
      }: ResolverContext
    ) => people.load(stockAdjustment.adjustedBy),
    refPhysicalStore: async (
      stockAdjustment: StockAdjustment,
      _args: unknown,
      {
        loaders: {
          inventory: { physicalStores },
        },
      }: ResolverContext
    ) => {
      return physicalStores.load(stockAdjustment.physicalStoreId);
    },
  },
  Query: {
    stockAdjustmentById: async (
      _obj: unknown,
      { _id }: Pick<StockAdjustmentArgs, '_id'>
    ) => {
      return StockAdjustments.findOneAsync(_id);
    },

    stockAdjustmentsByStockItem: async (
      _obj: unknown,
      { physicalStoreId, stockItemId }: Pick<
        StockAdjustmentArgs,
        'physicalStoreId' | 'stockItemId'
      >
    ) => {
      return getStockAdjustmentsByStockItemId(physicalStoreId, stockItemId);
    },

    pagedStockAdjustments: async (
      _obj: unknown,
      { physicalStoreId, queryString }: Pick<
        StockAdjustmentArgs,
        'physicalStoreId' | 'queryString'
      >
    ) => {
      return getStockAdjustments(queryString, physicalStoreId);
    },
  },

  Mutation: {
    createStockAdjustment: async (
      _obj: unknown,
      {
        physicalStoreId,
        stockItemId,
        adjustmentDate,
        adjustedBy,
        quantity,
        isInflow,
        adjustmentReason,
      }: StockAdjustmentArgs,
      { user }: ResolverContext
    ) => {
      const stockAdjustmentId = await createStockAdjustment(
        physicalStoreId,
        stockItemId,
        { adjustmentDate, adjustedBy, quantity, isInflow, adjustmentReason },
        user._id
      );
      return StockAdjustments.findOneAsync(stockAdjustmentId);
    },

    updateStockAdjustment: async (
      _obj: unknown,
      { _id, adjustmentDate, adjustedBy, quantity, isInflow, adjustmentReason }:
        StockAdjustmentArgs,
      { user }: ResolverContext
    ) => {
      await updateStockAdjustment(
        _id,
        { adjustmentDate, adjustedBy, quantity, isInflow, adjustmentReason },
        user._id
      );
      return StockAdjustments.findOneAsync(_id);
    },

    approveStockAdjustments: async (
      _obj: unknown,
      { _ids, physicalStoreId }: Pick<StockAdjustmentArgs, '_ids' | 'physicalStoreId'>,
      { user }: ResolverContext
    ) => {
      const date = new Date();
      await StockAdjustments.updateAsync(
        {
          physicalStoreId,
          _id: { $in: _ids },
          approvedOn: { $exists: false },
          approvedBy: { $exists: false },
        },
        {
          $set: {
            approvedOn: date,
            approvedBy: user._id,
          },
        },
        { multi: true }
      );

      return StockAdjustments.find({
        physicalStoreId,
        _id: { $in: _ids },
      }).fetchAsync();
    },

    removeStockAdjustments: async (
      _obj: unknown,
      { _ids, physicalStoreId }: Pick<StockAdjustmentArgs, '_ids' | 'physicalStoreId'>
    ) => removeStockAdjustments(physicalStoreId, _ids),
  },
};
