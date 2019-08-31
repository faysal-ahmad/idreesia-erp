import { Karkuns } from 'meteor/idreesia-common/collections/hr';
import {
  StockAdjustments,
  StockItems,
} from 'meteor/idreesia-common/collections/inventory';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/api/security';
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
    refAdjustedBy: stockAdjustment =>
      Karkuns.findOne({
        _id: { $eq: stockAdjustment.adjustedBy },
      }),
    refCreatedBy: stockAdjustment =>
      Karkuns.findOne({
        _id: { $eq: stockAdjustment.createdBy },
      }),
    refUpdatedBy: stockAdjustment =>
      Karkuns.findOne({
        _id: { $eq: stockAdjustment.updatedBy },
      }),
    refApprovedBy: stockAdjustment => {
      if (stockAdjustment.approvedBy) return null;
      return Karkuns.findOne({
        _id: { $eq: stockAdjustment.approvedBy },
      });
    },
  },
  Query: {
    stockAdjustmentsByStockItem(
      obj,
      { physicalStoreId, stockItemId },
      { user }
    ) {
      if (
        hasInstanceAccess(user._id, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_STOCK_ITEMS,
          PermissionConstants.IN_MANAGE_STOCK_ITEMS,
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
        hasInstanceAccess(user._id, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_STOCK_ITEMS,
          PermissionConstants.IN_MANAGE_STOCK_ITEMS,
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
          PermissionConstants.IN_VIEW_STOCK_ITEMS,
          PermissionConstants.IN_MANAGE_STOCK_ITEMS,
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        return null;
      }

      const stockAdjustment = StockAdjustments.findOne(_id);
      if (
        hasInstanceAccess(user._id, stockAdjustment.physicalStoreId) === false
      ) {
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

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
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
        hasInstanceAccess(user._id, existingAdjustment.physicalStoreId) ===
          false
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
        hasInstanceAccess(user._id, existingAdjustment.physicalStoreId) ===
          false
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
        hasInstanceAccess(user._id, existingAdjustment.physicalStoreId) ===
          false
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
