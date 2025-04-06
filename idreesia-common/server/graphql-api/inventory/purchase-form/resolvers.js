import {
  PurchaseForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';

import getPurchaseForms, {
  getPurchaseFormsByStockItemId,
  getPurchaseFormsByMonth,
} from './queries';

export default {
  PurchaseForm: {
    attachments: async (
      purchaseForm,
      args,
      {
        loaders: {
          common: { attachments },
        },
      }
    ) => {
      const { attachmentIds } = purchaseForm;
      if (attachmentIds && attachmentIds.length > 0) {
        return Promise.all(
          attachmentIds.map(attachmentId => attachments.load(attachmentId))
        );
      }

      return [];
    },
    refLocation: async (
      purchaseForm,
      args,
      {
        loaders: {
          inventory: { locations },
        },
      }
    ) => {
      if (purchaseForm?.locationId) {
        return locations.load(purchaseForm.locationId);
      }
      return null;
    },
    refReceivedBy: async (
      purchaseForm,
      args,
      {
        loaders: {
          common: { people },
        },
      }
    ) => {
      const person = await people.load(purchaseForm.receivedBy);
      return People.personToKarkun(person);
    },
    refPurchasedBy: async (
      purchaseForm,
      args,
      {
        loaders: {
          common: { people },
        },
      }
    ) => {
      const person = await people.load(purchaseForm.purchasedBy);
      return People.personToKarkun(person);
    },
    refVendor: async (
      purchaseForm,
      args,
      {
        loaders: {
          inventory: { vendors },
        },
      }
    ) => {
      if (purchaseForm.vendorId) {
        return vendors.load(purchaseForm.vendorId);
      }
      return null;
    },
    refPhysicalStore: async (
      purchaseForm,
      args,
      {
        loaders: {
          inventory: { physicalStores },
        },
      }
    ) => {
      return physicalStores.load(purchaseForm.physicalStoreId);
    },
  },
  Query: {
    purchaseFormById: async (obj, { _id }, { user }) => {
      return PurchaseForms.findOneAsync(_id);
    },

    purchaseFormsByStockItem: async (
      obj,
      { physicalStoreId, stockItemId },
      { user }
    ) => {
      return getPurchaseFormsByStockItemId(physicalStoreId, stockItemId);
    },

    purchaseFormsByMonth: async (obj, { physicalStoreId, month }, { user }) => {
      return getPurchaseFormsByMonth(physicalStoreId, month);
    },

    pagedPurchaseForms: async (
      obj,
      { physicalStoreId, queryString },
      { user }
    ) => {
      return getPurchaseForms(queryString, physicalStoreId);
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
        physicalStoreId,
        purchaseDate,
        receivedBy,
        purchasedBy,
        locationId,
        vendorId,
        items,
        notes,
      },
      { user }
    ) => {
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

    addPurchaseFormAttachment: async (
      obj,
      { _id, physicalStoreId, attachmentId },
      { user }
    ) => {
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

    removePurchaseFormAttachment: async (
      obj,
      { _id, physicalStoreId, attachmentId },
      { user }
    ) => {
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
