import { IssuanceForms } from 'meteor/idreesia-common/server/collections/inventory';
import {
  createIssuanceForm,
  removeIssuanceFormAttachment,
  removeIssuanceForms,
  updateIssuanceForm,
} from 'meteor/idreesia-common/server/business-logic/inventory/issuance-forms';

import getIssuanceForms, {
  getIssuanceFormsByMonth,
  getIssuanceFormsByStockItemId,
} from 'meteor/idreesia-common/server/business-logic/inventory/issuance-form-search';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  IssuanceForm: {
    attachments: async (
      issuanceForm,
      args,
      {
        loaders: {
          common: { attachments },
        },
      }
    ) => {
      const { attachmentIds } = issuanceForm;
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
      issuanceForm,
      args,
      {
        loaders: {
          inventory: { locations },
        },
      }
    ) => {
      if (issuanceForm.locationId) {
        return locations.load(issuanceForm.locationId);
      }
      return null;
    },
    refIssuedBy: async (
      issuanceForm,
      args,
      {
        loaders: {
          common: { people },
        },
      }
    ) => {
      if (issuanceForm.issuedBy) {
        return people.load(issuanceForm.issuedBy);
      }
      return null;
    },
    refIssuedTo: async (
      issuanceForm,
      args,
      {
        loaders: {
          common: { people },
        },
      }
    ) => {
      if (issuanceForm.issuedTo) {
        return people.load(issuanceForm.issuedTo);
      }
      return null;
    },
    refPhysicalStore: async (
      issuanceForm,
      args,
      {
        loaders: {
          inventory: { physicalStores },
        },
      }
    ) => {
      return physicalStores.load(issuanceForm.physicalStoreId);
    },
  },
  Query: {
    issuanceFormsByStockItem: async (obj, { physicalStoreId, stockItemId }) => {
      return getIssuanceFormsByStockItemId(physicalStoreId, stockItemId);
    },

    issuanceFormsByMonth: async (obj, { physicalStoreId, month }) => {
      return getIssuanceFormsByMonth(physicalStoreId, month);
    },

    pagedIssuanceForms: async (obj, { physicalStoreId, queryString }) => {
      return getIssuanceForms(queryString, physicalStoreId);
    },

    issuanceFormById: async (obj, { _id }, { user }) => {
      return IssuanceForms.findOneAsync(_id);
    },
  },

  Mutation: {
    createIssuanceForm: async (
      obj,
      {
        issueDate,
        issuedBy,
        issuedTo,
        handedOverTo,
        physicalStoreId,
        locationId,
        items,
        notes,
      },
      { user }
    ) => {
      const issuanceFormId = await createIssuanceForm(
        {
          issueDate,
          issuedBy,
          issuedTo,
          handedOverTo,
          physicalStoreId,
          locationId,
          items,
          notes,
        },
        user._id
      );
      return IssuanceForms.findOneAsync(issuanceFormId);
    },

    updateIssuanceForm: async (
      obj,
      {
        _id,
        issueDate,
        issuedBy,
        issuedTo,
        handedOverTo,
        physicalStoreId,
        locationId,
        items,
        notes,
      },
      { user }
    ) => {
      await updateIssuanceForm(
        _id,
        {
          issueDate,
          issuedBy,
          issuedTo,
          handedOverTo,
          physicalStoreId,
          locationId,
          items,
          notes,
        },
        user._id
      );
      return IssuanceForms.findOneAsync(_id);
    },

    approveIssuanceForms: async (obj, { physicalStoreId, _ids }, { user }) => {
      const date = new Date();
      await IssuanceForms.updateAsync(
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

      return IssuanceForms.find({
        physicalStoreId,
        _id: { $in: _ids },
      }).fetchAsync();
    },

    addIssuanceFormAttachment: async (
      obj,
      { _id, physicalStoreId, attachmentId },
      { user }
    ) => {
      const date = new Date();
      await IssuanceForms.updateAsync(
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

      return IssuanceForms.findOneAsync(_id);
    },

    removeIssuanceFormAttachment: async (
      obj,
      { _id, physicalStoreId, attachmentId },
      { user }
    ) => {
      await removeIssuanceFormAttachment(
        _id,
        physicalStoreId,
        attachmentId,
        user._id
      );
      return IssuanceForms.findOneAsync(_id);
    },

    removeIssuanceForms: async (obj, { physicalStoreId, _ids }) =>
      removeIssuanceForms(physicalStoreId, _ids),
  },
};

export default resolvers;
