import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  StockAdjustments,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

import getStockAdjustments, {
  getStockAdjustmentsByStockItemId,
} from './queries';

export default {
  StockAdjustment: {
    refStockItem: async (
      stockAdjustment,
      args,
      {
        loaders: {
          inventory: { stockItems },
        },
      }
    ) => stockItems.load(stockAdjustment.stockItemId),
    refAdjustedBy: async (
      stockAdjustment,
      args,
      {
        loaders: {
          common: { people },
        },
      }
    ) => {
      const person = await people.load(stockAdjustment.adjustedBy);
      return People.personToKarkun(person);
    },
    refPhysicalStore: async (
      stockAdjustment,
      args,
      {
        loaders: {
          inventory: { physicalStores },
        },
      }
    ) => {
      return physicalStores.load(stockAdjustment.physicalStoreId);
    },
  },
  Query: {
    stockAdjustmentById: async (obj, { _id }, { user }) => {
      return StockAdjustments.findOneAsync(_id);
    },

    stockAdjustmentsByStockItem: async (
      obj,
      { physicalStoreId, stockItemId },
      { user }
    ) => {
      return getStockAdjustmentsByStockItemId(physicalStoreId, stockItemId);
    },

    pagedStockAdjustments: async (
      obj,
      { physicalStoreId, queryString },
      { user }
    ) => {
      return getStockAdjustments(queryString, physicalStoreId);
    },
  },

  Mutation: {
    createStockAdjustment: async (
      obj,
      {
        physicalStoreId,
        stockItemId,
        adjustmentDate,
        adjustedBy,
        quantity,
        isInflow,
        adjustmentReason,
      },
      { user }
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
      obj,
      { _id, adjustmentDate, adjustedBy, quantity, isInflow, adjustmentReason },
      { user }
    ) => {
      const existingAdjustment = await StockAdjustments.findOneAsync(_id);

      // Undo the effect of previous values
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

      // Apply the effect of new values
      if (isInflow) {
        await StockItems.incrementCurrentLevel(
          existingAdjustment.stockItemId,
          quantity
        );
      } else {
        await StockItems.decrementCurrentLevel(
          existingAdjustment.stockItemId,
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
      obj,
      { _ids, physicalStoreId },
      { user }
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
      });
    },

    removeStockAdjustments: async (
      obj,
      { _ids, physicalStoreId },
      { user }
    ) => {
      const existingAdjustments = StockAdjustments.find({
        _id: { $in: _ids },
        physicalStoreId,
        approvedOn: { $exists: false },
        approvedBy: { $exists: false },
      });

      await existingAdjustments.forEachAsync(async existingAdjustment => {
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
