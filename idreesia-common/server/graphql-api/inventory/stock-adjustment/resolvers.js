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
    refStockItem: stockAdjustment =>
      StockItems.findOne({
        _id: { $eq: stockAdjustment.stockItemId },
      }),
    refAdjustedBy: stockAdjustment => {
      const person = People.findOne({
        _id: { $eq: stockAdjustment.adjustedBy },
      });
      return People.personToKarkun(person);
    },
  },
  Query: {
    stockAdjustmentsByStockItem(
      obj,
      { physicalStoreId, stockItemId },
      { user }
    ) {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        return [];
      }

      return getStockAdjustmentsByStockItemId(physicalStoreId, stockItemId);
    },

    pagedStockAdjustments(obj, { physicalStoreId, queryString }, { user }) {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
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

    stockAdjustmentById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        return null;
      }

      const stockAdjustment = StockAdjustments.findOne(_id);
      if (hasInstanceAccess(user, stockAdjustment.physicalStoreId) === false) {
        return null;
      }
      return stockAdjustment;
    },
  },

  Mutation: {
    createStockAdjustment(
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
    ) {
      if (
        !hasOnePermission(user._id, [
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
      const stockAdjustmentId = StockAdjustments.insert({
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
        StockItems.incrementCurrentLevel(stockItemId, quantity);
      } else {
        StockItems.decrementCurrentLevel(stockItemId, quantity);
      }

      return StockAdjustments.findOne(stockAdjustmentId);
    },

    updateStockAdjustment(
      obj,
      { _id, adjustmentDate, adjustedBy, quantity, isInflow, adjustmentReason },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Stock Adjustments in the System.'
        );
      }

      const existingAdjustment = StockAdjustments.findOne(_id);
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
        StockItems.decrementCurrentLevel(
          existingAdjustment.stockItemId,
          existingAdjustment.quantity
        );
      } else {
        StockItems.incrementCurrentLevel(
          existingAdjustment.stockItemId,
          existingAdjustment.quantity
        );
      }

      // Apply the effect of new values
      if (isInflow) {
        StockItems.incrementCurrentLevel(
          existingAdjustment.stockItemId,
          quantity
        );
      } else {
        StockItems.decrementCurrentLevel(
          existingAdjustment.stockItemId,
          quantity
        );
      }

      const date = new Date();
      StockAdjustments.update(
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

      return StockAdjustments.findOne(_id);
    },

    approveStockAdjustment(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to approve Stock Adjustments in the System.'
        );
      }

      const existingAdjustment = StockAdjustments.findOne(_id);
      if (
        !existingAdjustment ||
        hasInstanceAccess(user, existingAdjustment.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to approve Stock Adjustments in this Physical Store.'
        );
      }

      const date = new Date();
      StockAdjustments.update(_id, {
        $set: {
          approvedOn: date,
          approvedBy: user._id,
        },
      });

      return StockAdjustments.findOne(_id);
    },

    removeStockAdjustment(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.IN_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to manage Stock Adjustments in the System.'
        );
      }

      const existingAdjustment = StockAdjustments.findOne(_id);
      if (
        !existingAdjustment ||
        hasInstanceAccess(user, existingAdjustment.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Stock Adjustments in this Physical Store.'
        );
      }

      // Undo the effect of this adjustment
      if (existingAdjustment.isInflow) {
        StockItems.decrementCurrentLevel(
          existingAdjustment.stockItemId,
          existingAdjustment.quantity
        );
      } else {
        StockItems.incrementCurrentLevel(
          existingAdjustment.stockItemId,
          existingAdjustment.quantity
        );
      }

      return StockAdjustments.remove(_id);
    },
  },
};
