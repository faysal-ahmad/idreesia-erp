import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Locations,
  IssuanceForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
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
    refLocation: issuanceForm => {
      if (issuanceForm.locationId) {
        return Locations.findOne({
          _id: { $eq: issuanceForm.locationId },
        });
      }
      return null;
    },
    refIssuedBy: issuanceForm => {
      const person = People.findOne({
        _id: { $eq: issuanceForm.issuedBy },
      });
      return People.personToKarkun(person);
    },
    refIssuedTo: issuanceForm => {
      const person = People.findOne({
        _id: { $eq: issuanceForm.issuedTo },
      });
      return People.personToKarkun(person);
    },
  },
  Query: {
    issuanceFormsByStockItem(obj, { physicalStoreId, stockItemId }, { user }) {
      if (
        hasInstanceAccess(user._id, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        return [];
      }

      return getIssuanceFormsByStockItemId(physicalStoreId, stockItemId);
    },

    issuanceFormsByMonth(obj, { physicalStoreId, month }, { user }) {
      if (
        hasInstanceAccess(user._id, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        return [];
      }

      return getIssuanceFormsByMonth(physicalStoreId, month);
    },

    pagedIssuanceForms(obj, { physicalStoreId, queryString }, { user }) {
      if (
        hasInstanceAccess(user._id, physicalStoreId) === false ||
        !hasOnePermission(user._id, [
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

    issuanceFormById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        return null;
      }

      const issuanceForm = IssuanceForms.findOne(_id);
      if (hasInstanceAccess(user._id, issuanceForm.physicalStoreId) === false) {
        return null;
      }
      return issuanceForm;
    },
  },

  Mutation: {
    createIssuanceForm(
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
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in the System.'
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in this Physical Store.'
        );
      }

      const date = new Date();
      const issuanceFormId = IssuanceForms.insert({
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

      items.forEach(({ stockItemId, quantity, isInflow }) => {
        if (isInflow) {
          StockItems.incrementCurrentLevel(stockItemId, quantity);
        } else {
          StockItems.decrementCurrentLevel(stockItemId, quantity);
        }
      });

      return IssuanceForms.findOne(issuanceFormId);
    },

    updateIssuanceForm(
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
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in the System.'
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in this Physical Store.'
        );
      }

      const existingForm = IssuanceForms.findOne(_id);
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
      IssuanceForms.update(
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

      return IssuanceForms.findOne(_id);
    },

    approveIssuanceForm(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          'You do not have permission to approve Issuance Forms in the System.'
        );
      }

      const existingIssuanceForm = IssuanceForms.findOne(_id);
      if (
        !existingIssuanceForm ||
        hasInstanceAccess(user._id, existingIssuanceForm.physicalStoreId) ===
          false
      ) {
        throw new Error(
          'You do not have permission to approve Issuance Forms in this Physical Store.'
        );
      }

      const date = new Date();
      IssuanceForms.update(_id, {
        $set: {
          approvedOn: date,
          approvedBy: user._id,
        },
      });

      return IssuanceForms.findOne(_id);
    },

    removeIssuanceForm(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.IN_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in the System.'
        );
      }

      const existingIssuanceForm = IssuanceForms.findOne(_id);
      if (
        !existingIssuanceForm ||
        hasInstanceAccess(user._id, existingIssuanceForm.physicalStoreId) ===
          false
      ) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in this Physical Store.'
        );
      }

      const existingForm = IssuanceForms.findOne(_id);
      const { items: existingItems } = existingForm;
      existingItems.forEach(({ stockItemId, quantity, isInflow }) => {
        if (isInflow) {
          StockItems.decrementCurrentLevel(stockItemId, quantity);
        } else {
          StockItems.incrementCurrentLevel(stockItemId, quantity);
        }
      });

      return IssuanceForms.remove(_id);
    },
  },
};
