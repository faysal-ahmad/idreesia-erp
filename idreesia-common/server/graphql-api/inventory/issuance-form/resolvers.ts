import {
  IssuanceForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

import getIssuanceForms, {
  getIssuanceFormsByMonth,
  getIssuanceFormsByStockItemId,
} from './queries';

interface FormItem {
  stockItemId: string;
  quantity: number;
  isInflow?: boolean;
}

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
      const date = new Date();
      const issuanceFormId = await IssuanceForms.insertAsync({
        issueDate,
        issuedBy,
        issuedTo,
        handedOverTo,
        physicalStoreId,
        locationId,
        items,
        notes,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      await Promise.all(
        items.map(({ stockItemId, quantity, isInflow }: FormItem) => {
          if (isInflow) {
            return StockItems.incrementCurrentLevel(stockItemId, quantity);
          }

          return StockItems.decrementCurrentLevel(stockItemId, quantity);
        })
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
      const existingForm = await IssuanceForms.findOneAsync(_id);
      if (!existingForm) {
        throw new Error('Issuance form not found.');
      }
      const typedExistingForm = existingForm as unknown as {
        approvedOn?: Date;
        approvedBy?: string;
        items: FormItem[];
      };
      if (typedExistingForm.approvedOn || typedExistingForm.approvedBy) {
        throw new Error('You cannot update an already approved Issuance Form.');
      }

      const { items: existingItems } = typedExistingForm;
      // Undo the effect of all previous items
      await Promise.all(
        existingItems.map(({ stockItemId, quantity, isInflow }: FormItem) => {
          if (isInflow) {
            return StockItems.decrementCurrentLevel(stockItemId, quantity);
          }

          return StockItems.incrementCurrentLevel(stockItemId, quantity);
        })
      );

      // Apply the effect of new incoming items
      await Promise.all(
        items.map(({ stockItemId, quantity, isInflow }: FormItem) => {
          if (isInflow) {
            return StockItems.incrementCurrentLevel(stockItemId, quantity);
          }

          return StockItems.decrementCurrentLevel(stockItemId, quantity);
        })
      );

      const date = new Date();
      await IssuanceForms.updateAsync(
        {
          _id: { $eq: _id },
          approvedOn: { $eq: null },
          approvedBy: { $eq: null },
        },
        {
          $set: {
            issueDate,
            issuedBy,
            issuedTo,
            handedOverTo,
            physicalStoreId,
            locationId,
            items,
            notes,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
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
      const date = new Date();
      await IssuanceForms.updateAsync(
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
      return IssuanceForms.findOneAsync(_id);
    },

    removeIssuanceForms: async (obj, { physicalStoreId, _ids }, { user }) => {
      const existingIssuanceForms = IssuanceForms.find({
        _id: { $in: _ids },
        physicalStoreId,
        approvedOn: { $exists: false },
        approvedBy: { $exists: false },
      });

      await existingIssuanceForms.forEachAsync(async (existingForm: any): Promise<void> => {
        const { items: existingItems } = existingForm;
        await Promise.all(
          existingItems.map(({ stockItemId, quantity, isInflow }: FormItem) => {
            if (isInflow) {
              return StockItems.decrementCurrentLevel(stockItemId, quantity);
            }

            return StockItems.incrementCurrentLevel(stockItemId, quantity);
          })
        );
      });

      return IssuanceForms.removeAsync({ _id: { $in: _ids }, physicalStoreId });
    },
  },
};

export default resolvers;
