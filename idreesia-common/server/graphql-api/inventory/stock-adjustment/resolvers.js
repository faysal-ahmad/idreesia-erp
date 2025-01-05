import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  StockAdjustments,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import getStockAdjustments, {
  getStockAdjustmentsByStockItemId,
} from './queries';

export default {
  StockAdjustment: {
    refStockItem: async stockAdjustment =>
      StockItems.findOneAsync({
        _id: { $eq: stockAdjustment.stockItemId },
      }),
    refAdjustedBy: async stockAdjustment => {
      const person = await People.findOneAsync({
        _id: { $eq: stockAdjustment.adjustedBy },
      });
      return People.personToKarkun(person);
    },
  },
  Query: {
    stockAdjustmentsByStockItem: async (
      obj,
      { physicalStoreId, stockItemId },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        return [];
      }

      return getStockAdjustmentsByStockItemId(physicalStoreId, stockItemId);
    },

    pagedStockAdjustments: async (
      obj,
      { physicalStoreId, queryString },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getStockAdjustments(queryString, physicalStoreId);
    },

    stockAdjustmentById: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        return null;
      }

      const stockAdjustment = await StockAdjustments.findOneAsync(_id);
      if (hasInstanceAccess(user, stockAdjustment.physicalStoreId) === false) {
        return null;
      }
      return stockAdjustment;
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
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Stock Adjustments in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Stock Adjustments in this Physical Store.'
        );
      }

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
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Stock Adjustments in the System.'
        );
      }

      const existingAdjustment = await StockAdjustments.findOneAsync(_id);
      if (
        !existingAdjustment ||
        hasInstanceAccess(user, existingAdjustment.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Stock Adjustments in this Physical Store.'
        );
      }

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
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to approve Stock Adjustments in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to approve Stock Adjustments in this Physical Store.'
        );
      }

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
      if (!hasOnePermission(user, [PermissionConstants.IN_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to manage Stock Adjustments in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Stock Adjustments in this Physical Store.'
        );
      }

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
