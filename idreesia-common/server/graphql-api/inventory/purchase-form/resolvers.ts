import { PurchaseForms } from 'meteor/idreesia-common/server/collections/inventory';
import {
  createPurchaseForm,
  removePurchaseFormAttachment,
  removePurchaseForms,
  updatePurchaseForm,
} from 'meteor/idreesia-common/server/business-logic/inventory/purchase-forms';

import getPurchaseForms, {
  getPurchaseFormsByStockItemId,
  getPurchaseFormsByMonth,
} from 'meteor/idreesia-common/server/business-logic/inventory/purchase-form-search';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
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
          attachmentIds.map((attachmentId: string) =>
            attachments.load(attachmentId)
          )
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
      return people.load(purchaseForm.receivedBy);
    },
    refPurchasedBy: async (
      purchaseForm,
      args,
      {
        loaders: {
          common: { people },
        },
      }
    ) => people.load(purchaseForm.purchasedBy),
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
      const purchaseFormId = await createPurchaseForm(
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
        user._id
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
      await updatePurchaseForm(
        _id,
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
        user._id
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
      }).fetchAsync();
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
      await removePurchaseFormAttachment(
        _id,
        physicalStoreId,
        attachmentId,
        user._id
      );
      return PurchaseForms.findOneAsync(_id);
    },

    removePurchaseForms: async (obj, { physicalStoreId, _ids }) =>
      removePurchaseForms(physicalStoreId, _ids),
  },
};

export default resolvers;
