import {
  Locations,
  IssuanceForms,
  StockItems,
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

import getIssuanceForms, {
  getIssuanceFormsByMonth,
  getIssuanceFormsByStockItemId,
} from './queries';

export default {
  IssuanceForm: {
    attachments: async issuanceForm => {
      const { attachmentIds } = issuanceForm;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetchAsync();
      }

      return [];
    },
    refLocation: async issuanceForm => {
      if (issuanceForm?.locationId) {
        return Locations.findOneAsync({
          _id: { $eq: issuanceForm.locationId },
        });
      }
      return null;
    },
    refIssuedBy: async issuanceForm => {
      if (issuanceForm?.issuedBy) {
        const person = await People.findOneAsync({
          _id: { $eq: issuanceForm.issuedBy },
        });
        return People.personToKarkun(person);
      }
      return null;
    },
    refIssuedTo: async issuanceForm => {
      if (issuanceForm?.issuedTo) {
        const person = await People.findOneAsync({
          _id: { $eq: issuanceForm.issuedTo },
        });
        return People.personToKarkun(person);
      }
      return null;
    },
  },
  Query: {
    issuanceFormsByStockItem: async (
      obj,
      { physicalStoreId, stockItemId },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        return [];
      }

      return getIssuanceFormsByStockItemId(physicalStoreId, stockItemId);
    },

    issuanceFormsByMonth: async (obj, { physicalStoreId, month }, { user }) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        return [];
      }

      return getIssuanceFormsByMonth(physicalStoreId, month);
    },

    pagedIssuanceForms: async (
      obj,
      { physicalStoreId, queryString },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        return {
          issuanceForms: [],
          totalResults: 0,
        };
      }

      return getIssuanceForms(queryString, physicalStoreId);
    },

    issuanceFormById: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        return null;
      }

      const issuanceForm = await IssuanceForms.findOneAsync(_id);
      if (hasInstanceAccess(user, issuanceForm.physicalStoreId) === false) {
        return null;
      }
      return issuanceForm;
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
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in this Physical Store.'
        );
      }

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
        items.map(({ stockItemId, quantity, isInflow }) => {
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
      if (
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in this Physical Store.'
        );
      }

      const existingForm = await IssuanceForms.findOneAsync(_id);
      if (existingForm.approvedOn || existingForm.approvedBy) {
        throw new Error('You cannot update an already approved Issuance Form.');
      }

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
      if (
        !hasOnePermission(user, [PermissionConstants.IN_APPROVE_ISSUANCE_FORMS])
      ) {
        throw new Error(
          'You do not have permission to approve Issuance Forms in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to approve Issuance Forms in this Physical Store.'
        );
      }

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
      });
    },

    addIssuanceFormAttachment: async (
      obj,
      { _id, physicalStoreId, attachmentId },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in the System.'
        );
      }

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
      if (
        hasInstanceAccess(user, physicalStoreId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in the System.'
        );
      }

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
      if (!hasOnePermission(user, [PermissionConstants.IN_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in this Physical Store.'
        );
      }

      const existingIssuanceForms = IssuanceForms.find({
        _id: { $in: _ids },
        physicalStoreId,
        approvedOn: { $exists: false },
        approvedBy: { $exists: false },
      });

      await existingIssuanceForms.forEachAsync(async existingForm => {
        const { items: existingItems } = existingForm;
        return Promise.all(
          existingItems.map(({ stockItemId, quantity, isInflow }) => {
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
