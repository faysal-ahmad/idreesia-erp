import { Karkuns } from "meteor/idreesia-common/collections/hr";
import {
  StockAdjustments,
  PhysicalStores,
  StockItems,
} from "meteor/idreesia-common/collections/inventory";
import {
  filterByInstanceAccess,
  hasInstanceAccess,
  hasOnePermission,
} from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getStockAdjustments, {
  getStockAdjustmentsByStockItemId,
} from "./queries";

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
    stockAdjustmentsByStockItem(obj, { stockItemId }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_STOCK_ITEMS,
          PermissionConstants.IN_MANAGE_STOCK_ITEMS,
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        return [];
      }

      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(
        userId,
        physicalStores
      );
      if (filteredPhysicalStores.length === 0) return [];

      return getStockAdjustmentsByStockItemId(
        stockItemId,
        filteredPhysicalStores
      );
    },

    pagedStockAdjustments(obj, { physicalStoreId, queryString }, { userId }) {
      if (
        hasInstanceAccess(userId, physicalStoreId) === false ||
        !hasOnePermission(userId, [
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

    stockAdjustmentById(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_STOCK_ITEMS,
          PermissionConstants.IN_MANAGE_STOCK_ITEMS,
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        return null;
      }

      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(
        userId,
        physicalStores
      );
      if (filteredPhysicalStores.length === 0) return null;
      const physicalStoreIds = physicalStores.map(
        physicalStore => physicalStore._id
      );

      return StockAdjustments.findOne({
        _id: { $eq: _id },
        physicalStoreId: { $in: physicalStoreIds },
      });
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
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Stock Adjustments in the System."
        );
      }

      if (hasInstanceAccess(userId, physicalStoreId) === false) {
        throw new Error(
          "You do not have permission to manage Stock Adjustments in this Physical Store."
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
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
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
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Stock Adjustments in the System."
        );
      }

      const existingAdjustment = StockAdjustments.findOne(_id);
      if (
        !existingAdjustment ||
        hasInstanceAccess(userId, existingAdjustment.physicalStoreId) === false
      ) {
        throw new Error(
          "You do not have permission to manage Stock Adjustments in this Physical Store."
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
            updatedBy: userId,
          },
        }
      );

      return StockAdjustments.findOne(_id);
    },

    approveStockAdjustment(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        throw new Error(
          "You do not have permission to approve Stock Adjustments in the System."
        );
      }

      const existingAdjustment = StockAdjustments.findOne(_id);
      if (
        !existingAdjustment ||
        hasInstanceAccess(userId, existingAdjustment.physicalStoreId) === false
      ) {
        throw new Error(
          "You do not have permission to approve Stock Adjustments in this Physical Store."
        );
      }

      const date = new Date();
      StockAdjustments.update(_id, {
        $set: {
          approvedOn: date,
          approvedBy: userId,
        },
      });

      return StockAdjustments.findOne(_id);
    },

    removeStockAdjustment(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Stock Adjustments in the System."
        );
      }

      const existingAdjustment = StockAdjustments.findOne(_id);
      if (
        !existingAdjustment ||
        hasInstanceAccess(userId, existingAdjustment.physicalStoreId) === false
      ) {
        throw new Error(
          "You do not have permission to manage Stock Adjustments in this Physical Store."
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
