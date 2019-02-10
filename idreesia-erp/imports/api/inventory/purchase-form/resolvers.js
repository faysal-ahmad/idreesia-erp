import { Karkuns } from "meteor/idreesia-common/collections/hr";
import {
  PurchaseForms,
  PhysicalStores,
  StockItems,
} from "meteor/idreesia-common/collections/inventory";
import {
  filterByInstanceAccess,
  hasInstanceAccess,
  hasOnePermission,
} from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getPurchaseForms, { getPurchaseFormsByStockItemId } from "./queries";

export default {
  PurchaseForm: {
    refReceivedBy: purchaseForm =>
      Karkuns.findOne({
        _id: { $eq: purchaseForm.receivedBy },
      }),
    refPurchasedBy: purchaseForm =>
      Karkuns.findOne({
        _id: { $eq: purchaseForm.purchasedBy },
      }),
    refCreatedBy: purchaseForm =>
      Karkuns.findOne({
        _id: { $eq: purchaseForm.createdBy },
      }),
    refUpdatedBy: purchaseForm =>
      Karkuns.findOne({
        _id: { $eq: purchaseForm.updatedBy },
      }),
    refApprovedBy: purchaseForm => {
      if (purchaseForm.approvedBy) {
        return Karkuns.findOne({
          _id: { $eq: purchaseForm.approvedBy },
        });
      }
      return null;
    },
  },
  Query: {
    purchaseFormsByStockItem(obj, { stockItemId }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
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

      return getPurchaseFormsByStockItemId(stockItemId, filteredPhysicalStores);
    },

    pagedPurchaseForms(obj, { physicalStoreId, queryString }, { userId }) {
      if (
        hasInstanceAccess(userId, physicalStoreId) === false ||
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return {
          purchaseForms: [],
          totalResults: 0,
        };
      }

      return getPurchaseForms(queryString, physicalStoreId);
    },

    purchaseFormById(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return null;
      }

      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(
        userId,
        physicalStores
      );
      if (filteredPhysicalStores.length === 0) return [];
      const physicalStoreIds = physicalStores.map(
        physicalStore => physicalStore._id
      );

      return PurchaseForms.findOne({
        _id: { $eq: _id },
        physicalStoreId: { $in: physicalStoreIds },
      });
    },
  },

  Mutation: {
    createPurchaseForm(
      obj,
      { purchaseDate, receivedBy, purchasedBy, physicalStoreId, items, notes },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in the System."
        );
      }

      if (hasInstanceAccess(userId, physicalStoreId) === false) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in this Physical Store."
        );
      }

      const date = new Date();
      const purchaseFormId = PurchaseForms.insert({
        purchaseDate,
        receivedBy,
        purchasedBy,
        physicalStoreId,
        items,
        notes,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      items.forEach(({ stockItemId, quantity, isInflow }) => {
        if (isInflow) {
          StockItems.incrementCurrentLevel(stockItemId, quantity);
        } else {
          StockItems.decrementCurrentLevel(stockItemId, quantity);
        }
      });

      return PurchaseForms.findOne(purchaseFormId);
    },

    updatePurchaseForm(
      obj,
      {
        _id,
        purchaseDate,
        receivedBy,
        purchasedBy,
        physicalStoreId,
        items,
        notes,
      },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in the System."
        );
      }

      if (hasInstanceAccess(userId, physicalStoreId) === false) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in this Physical Store."
        );
      }

      const existingForm = PurchaseForms.findOne(_id);
      const { items: existingItems } = existingForm;
      // Undo the effect of all previous items
      existingItems.forEach(({ stockItemId, quantity, isInflow }) => {
        if (isInflow) {
          StockItems.decrementCurrentLevel(stockItemId, quantity);
        } else {
          StockItems.incrementCurrentLevel(stockItemId, quantity);
        }
      });

      // Apply the effect of new incoming items
      items.forEach(({ stockItemId, quantity, isInflow }) => {
        if (isInflow) {
          StockItems.incrementCurrentLevel(stockItemId, quantity);
        } else {
          StockItems.decrementCurrentLevel(stockItemId, quantity);
        }
      });

      const date = new Date();
      PurchaseForms.update(
        {
          _id: { $eq: _id },
          approvedOn: { $eq: null },
          approvedBy: { $eq: null },
        },
        {
          $set: {
            purchaseDate,
            receivedBy,
            purchasedBy,
            physicalStoreId,
            items,
            notes,
            updatedAt: date,
            updatedBy: userId,
          },
        }
      );

      return PurchaseForms.findOne(_id);
    },

    approvePurchaseForm(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to approve Purchase Forms in the System."
        );
      }

      const existingPurchaseForm = PurchaseForms.findOne(_id);
      if (
        !existingPurchaseForm ||
        hasInstanceAccess(userId, existingPurchaseForm.physicalStoreId) ===
          false
      ) {
        throw new Error(
          "You do not have permission to approve Purchase Forms in this Physical Store."
        );
      }

      const date = new Date();
      PurchaseForms.update(_id, {
        $set: {
          approvedOn: date,
          approvedBy: userId,
        },
      });

      return PurchaseForms.findOne(_id);
    },

    removePurchaseForm(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in the System."
        );
      }

      const existingPurchaseForm = PurchaseForms.findOne(_id);
      if (
        !existingPurchaseForm ||
        hasInstanceAccess(userId, existingPurchaseForm.physicalStoreId) ===
          false
      ) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in this Physical Store."
        );
      }

      const existingForm = PurchaseForms.findOne(_id);
      const { items: existingItems } = existingForm;
      existingItems.forEach(({ stockItemId, quantity, isInflow }) => {
        if (isInflow) {
          StockItems.decrementCurrentLevel(stockItemId, quantity);
        } else {
          StockItems.incrementCurrentLevel(stockItemId, quantity);
        }
      });

      return PurchaseForms.remove(_id);
    },
  },
};
