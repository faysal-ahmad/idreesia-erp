import {
  PurchaseForms,
  StockItems,
  Vendors,
  Locations,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import getPurchaseForms, {
  getPurchaseFormsByStockItemId,
  getPurchaseFormsByMonth,
} from './queries';

export default {
  PurchaseForm: {
    attachments: async purchaseForm => {
      const { attachmentIds } = purchaseForm;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetchAsync();
      }

      return [];
    },
    refLocation: async purchaseForm => {
      if (purchaseForm.locationId) {
        return Locations.findOneAsync({
          _id: { $eq: purchaseForm.locationId },
        });
      }
      return null;
    },
    refReceivedBy: async purchaseForm => {
      const person = await People.findOneAsync({
        _id: { $eq: purchaseForm.receivedBy },
      });
      return People.personToKarkun(person);
    },
    refPurchasedBy: async purchaseForm => {
      const person = await People.findOneAsync({
        _id: { $eq: purchaseForm.purchasedBy },
      });
      return People.personToKarkun(person);
    },
    refVendor: async purchaseForm =>
      Vendors.findOneAsync({
        _id: { $eq: purchaseForm.vendorId },
      }),
  },
  Query: {
    purchaseFormsByStockItem: async (
      obj,
      { physicalStoreId, stockItemId },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return [];
      }

      return getPurchaseFormsByStockItemId(physicalStoreId, stockItemId);
    },

    purchaseFormsByMonth: async (obj, { physicalStoreId, month }, { user }) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return [];
      }

      return getPurchaseFormsByMonth(physicalStoreId, month);
    },

    pagedPurchaseForms: async (
      obj,
      { physicalStoreId, queryString },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
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

    purchaseFormById: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return null;
      }

      const purchaseForm = await PurchaseForms.findOneAsync(_id);
      if (hasInstanceAccess(user, purchaseForm.physicalStoreId) === false) {
        return null;
      }
      return purchaseForm;
    },
  },

  Mutation: {
    createPurchaseForm: async (
      obj,
      {
        purchaseDate,
        receivedBy,
        purchasedBy,
        physicalStoreId,
        locationId,
        vendorId,
        items,
        notes,
      },
      { user }
    ) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Purchase Forms in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Purchase Forms in this Physical Store.'
        );
      }

      const date = new Date();
      const purchaseFormId = await PurchaseForms.insertAsync({
        purchaseDate,
        receivedBy,
        purchasedBy,
        physicalStoreId,
        locationId,
        vendorId,
        items,
        notes,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      await Promise.all(
        items.map(({ stockItemId, quantity, isInflow }) => {
          if (isInflow) {
            return StockItems.incrementCurrentLevel(stockItemId, quantity);
          }

          return StockItems.decrementCurrentLevel(stockItemId, quantity);
        })
      );

      return PurchaseForms.findOneAsync(purchaseFormId);
    },

    updatePurchaseForm: async (
      obj,
      {
        _id,
        purchaseDate,
        receivedBy,
        purchasedBy,
        physicalStoreId,
        locationId,
        vendorId,
        items,
        notes,
      },
      { user }
    ) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Purchase Forms in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Purchase Forms in this Physical Store.'
        );
      }

      const existingForm = await PurchaseForms.findOneAsync(_id);
      const { items: existingItems } = existingForm;
      // Undo the effect of all previous items
      await Promise.all(
        existingItems.map(({ stockItemId, quantity, isInflow }) => {
          if (isInflow) {
            return StockItems.decrementCurrentLevel(stockItemId, quantity);
          }

          return StockItems.incrementCurrentLevel(stockItemId, quantity);
        })
      );

      // Apply the effect of new incoming items
      await Promise.all(
        items.map(({ stockItemId, quantity, isInflow }) => {
          if (isInflow) {
            return StockItems.incrementCurrentLevel(stockItemId, quantity);
          }

          return StockItems.decrementCurrentLevel(stockItemId, quantity);
        })
      );

      const date = new Date();
      await PurchaseForms.updateAsync(
        {
          _id: { $eq: _id },
          approvedOn: { $exists: false },
          approvedBy: { $exists: false },
        },
        {
          $set: {
            purchaseDate,
            receivedBy,
            purchasedBy,
            physicalStoreId,
            locationId,
            vendorId,
            items,
            notes,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return PurchaseForms.findOneAsync(_id);
    },

    approvePurchaseForms: async (obj, { physicalStoreId, _ids }, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.IN_APPROVE_PURCHASE_FORMS])
      ) {
        throw new Error(
          'You do not have permission to approve Purchase Forms in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to approve Purchase Forms in this Physical Store.'
        );
      }

      const date = new Date();
      await PurchaseForms.updateAsync(
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

      return PurchaseForms.find({
        physicalStoreId,
        _id: { $in: _ids },
      });
    },

    addFormAttachment: async (
      obj,
      { _id, physicalStoreId, attachmentId },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Purchase Forms in the System.'
        );
      }

      const date = new Date();
      await PurchaseForms.updateAsync(
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

      return PurchaseForms.findOneAsync(_id);
    },

    removeFormAttachment: async (
      obj,
      { _id, physicalStoreId, attachmentId },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Purchase Forms in the System.'
        );
      }

      const date = new Date();
      await PurchaseForms.updateAsync(
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

      await Attachments.removeAsync(attachmentId);
      return PurchaseForms.findOneAsync(_id);
    },

    removePurchaseForms: async (obj, { physicalStoreId, _ids }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.IN_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to manage Purchase Forms in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Purchase Forms in this Physical Store.'
        );
      }

      const existingPurchaseForms = PurchaseForms.find({
        _id: { $in: _ids },
        physicalStoreId,
        approvedOn: { $exists: false },
        approvedBy: { $exists: false },
      });

      await existingPurchaseForms.forEachAsync(async existingForm => {
        const { items: existingItems } = existingForm;
        await Promise.all(
          existingItems.map(({ stockItemId, quantity, isInflow }) => {
            if (isInflow) {
              return StockItems.decrementCurrentLevel(stockItemId, quantity);
            }

            return StockItems.incrementCurrentLevel(stockItemId, quantity);
          })
        );
      });

      return PurchaseForms.removeAsync({ _id: { $in: _ids }, physicalStoreId });
    },
  },
};
