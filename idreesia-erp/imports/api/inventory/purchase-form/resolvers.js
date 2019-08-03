import { Karkuns } from "meteor/idreesia-common/collections/hr";
import {
  PurchaseForms,
  StockItems,
  Vendors,
} from "meteor/idreesia-common/collections/inventory";
import { Attachments } from "meteor/idreesia-common/collections/common";
import { hasInstanceAccess, hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getPurchaseForms, { getPurchaseFormsByStockItemId } from "./queries";

export default {
  PurchaseForm: {
    attachments: purchaseForm => {
      const { attachmentIds } = purchaseForm;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetch();
      }

      return [];
    },
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
    refVendor: purchaseForm =>
      Vendors.findOne({
        _id: { $eq: purchaseForm.vendorId },
      }),
  },
  Query: {
    purchaseFormsByStockItem(obj, { physicalStoreId, stockItemId }, { user }) {
      if (
        hasInstanceAccess(user._id, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return [];
      }

      return getPurchaseFormsByStockItemId(physicalStoreId, stockItemId);
    },

    pagedPurchaseForms(obj, { physicalStoreId, queryString }, { user }) {
      if (
        hasInstanceAccess(user._id, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
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

    purchaseFormById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return null;
      }

      const purchaseForm = PurchaseForms.findOne(_id);
      if (hasInstanceAccess(user._id, purchaseForm.physicalStoreId) === false) {
        return null;
      }
      return purchaseForm;
    },
  },

  Mutation: {
    createPurchaseForm(
      obj,
      {
        purchaseDate,
        receivedBy,
        purchasedBy,
        physicalStoreId,
        vendorId,
        items,
        notes,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in the System."
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
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
        vendorId,
        items,
        notes,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
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
        vendorId,
        items,
        notes,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in the System."
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
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
            vendorId,
            items,
            notes,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return PurchaseForms.findOne(_id);
    },

    approvePurchaseForm(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
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
        hasInstanceAccess(user._id, existingPurchaseForm.physicalStoreId) ===
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
          approvedBy: user._id,
        },
      });

      return PurchaseForms.findOne(_id);
    },

    addFormAttachment(obj, { _id, physicalStoreId, attachmentId }, { user }) {
      if (
        hasInstanceAccess(user._id, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in the System."
        );
      }

      const date = new Date();
      PurchaseForms.update(
        {
          _id,
          physicalStoreId,
        },
        {
          $addToSet: {
            attachmentIds: attachmentId,
          },
          $set: {
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return PurchaseForms.findOne(_id);
    },

    removeFormAttachment(
      obj,
      { _id, physicalStoreId, attachmentId },
      { user }
    ) {
      if (
        hasInstanceAccess(user._id, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Purchase Forms in the System."
        );
      }

      const date = new Date();
      PurchaseForms.update(
        { _id, physicalStoreId },
        {
          $pull: {
            attachmentIds: attachmentId,
          },
          $set: {
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      Attachments.remove(attachmentId);
      return PurchaseForms.findOne(_id);
    },

    removePurchaseForm(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
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
        hasInstanceAccess(user._id, existingPurchaseForm.physicalStoreId) ===
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
