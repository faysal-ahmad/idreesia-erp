import type DataLoader from 'dataloader';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  StockAdjustments,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

import getStockAdjustments, {
  getStockAdjustmentsByStockItemId,
} from './queries';

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
    ) => {
      const person = await people.load(stockAdjustment.adjustedBy);
      return People.personToKarkun(person as Parameters<typeof People.personToKarkun>[0]);
    },
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
      const date = new Date();
      const stockAdjustmentId = await StockAdjustments.insertAsync({
        physicalStoreId,
        stockItemId,
        adjustmentDate,
        adjustedBy,
        quantity,
        isInflow,
        adjustmentReason,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      if (isInflow) {
        await StockItems.incrementCurrentLevel(stockItemId, quantity);
      } else {
        await StockItems.decrementCurrentLevel(stockItemId, quantity);
      }

      return StockAdjustments.findOneAsync(stockAdjustmentId);
    },

    updateStockAdjustment: async (
      _obj: unknown,
      { _id, adjustmentDate, adjustedBy, quantity, isInflow, adjustmentReason }:
        StockAdjustmentArgs,
      { user }: ResolverContext
    ) => {
      const existingAdjustment = await StockAdjustments.findOneAsync(_id);
      if (!existingAdjustment) {
        throw new Error('Stock adjustment not found.');
      }
      const typedExistingAdjustment =
        existingAdjustment as unknown as StockAdjustment;

      // Undo the effect of previous values
      if (typedExistingAdjustment.isInflow) {
        await StockItems.decrementCurrentLevel(
          typedExistingAdjustment.stockItemId,
          typedExistingAdjustment.quantity
        );
      } else {
        await StockItems.incrementCurrentLevel(
          typedExistingAdjustment.stockItemId,
          typedExistingAdjustment.quantity
        );
      }

      // Apply the effect of new values
      if (isInflow) {
        await StockItems.incrementCurrentLevel(
          typedExistingAdjustment.stockItemId,
          quantity
        );
      } else {
        await StockItems.decrementCurrentLevel(
          typedExistingAdjustment.stockItemId,
          quantity
        );
      }

      const date = new Date();
      await StockAdjustments.updateAsync(
        {
          _id: { $eq: _id },
          approvedOn: { $eq: null },
          approvedBy: { $eq: null },
        },
        {
          $set: {
            adjustmentDate,
            adjustedBy,
            quantity,
            isInflow,
            adjustmentReason,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
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
    ) => {
      const existingAdjustments = StockAdjustments.find({
        _id: { $in: _ids },
        physicalStoreId,
        approvedOn: { $exists: false },
        approvedBy: { $exists: false },
      });

      await existingAdjustments.forEachAsync(async (existingAdjustmentRecord: unknown) => {
        const existingAdjustment = existingAdjustmentRecord as unknown as StockAdjustment;
        // Undo the effect of this adjustment
        if (existingAdjustment.isInflow) {
          await StockItems.decrementCurrentLevel(
            existingAdjustment.stockItemId,
            existingAdjustment.quantity
          );
        } else {
          await StockItems.incrementCurrentLevel(
            existingAdjustment.stockItemId,
            existingAdjustment.quantity
          );
        }
      });

      return StockAdjustments.removeAsync({
        _id: { $in: _ids },
        physicalStoreId,
      });
    },
  },
};
