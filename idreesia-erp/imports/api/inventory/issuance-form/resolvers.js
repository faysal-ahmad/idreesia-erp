import { Karkuns } from "meteor/idreesia-common/collections/hr";
import {
  Locations,
  IssuanceForms,
  PhysicalStores,
  StockItems,
} from "meteor/idreesia-common/collections/inventory";
import {
  filterByInstanceAccess,
  hasInstanceAccess,
  hasOnePermission,
} from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getIssuanceForms, { getIssuanceFormsByStockItemId } from "./queries";

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
    refIssuedBy: issuanceForm =>
      Karkuns.findOne({
        _id: { $eq: issuanceForm.issuedBy },
      }),
    refIssuedTo: issuanceForm =>
      Karkuns.findOne({
        _id: { $eq: issuanceForm.issuedTo },
      }),
    refCreatedBy: issuanceForm =>
      Karkuns.findOne({
        _id: { $eq: issuanceForm.createdBy },
      }),
    refUpdatedBy: issuanceForm =>
      Karkuns.findOne({
        _id: { $eq: issuanceForm.updatedBy },
      }),
    refApprovedBy: issuanceForm => {
      if (issuanceForm.approvedBy) {
        return Karkuns.findOne({
          _id: { $eq: issuanceForm.approvedBy },
        });
      }
      return null;
    },
  },
  Query: {
    issuanceFormsByStockItem(obj, { stockItemId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        return [];
      }

      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(
        user._id,
        physicalStores
      );
      if (filteredPhysicalStores.length === 0) return [];

      return getIssuanceFormsByStockItemId(stockItemId, filteredPhysicalStores);
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

      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(
        user._id,
        physicalStores
      );
      if (filteredPhysicalStores.length === 0) return [];
      const physicalStoreIds = physicalStores.map(
        physicalStore => physicalStore._id
      );

      return IssuanceForms.findOne({
        _id: { $eq: _id },
        physicalStoreId: { $in: physicalStoreIds },
      });
    },
  },

  Mutation: {
    createIssuanceForm(
      obj,
      {
        issueDate,
        issuedBy,
        issuedTo,
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
          "You do not have permission to manage Issuance Forms in the System."
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
        throw new Error(
          "You do not have permission to manage Issuance Forms in this Physical Store."
        );
      }

      const date = new Date();
      const issuanceFormId = IssuanceForms.insert({
        issueDate,
        issuedBy,
        issuedTo,
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
          "You do not have permission to manage Issuance Forms in the System."
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
        throw new Error(
          "You do not have permission to manage Issuance Forms in this Physical Store."
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
          "You do not have permission to approve Issuance Forms in the System."
        );
      }

      const existingIssuanceForm = IssuanceForms.findOne(_id);
      if (
        !existingIssuanceForm ||
        hasInstanceAccess(user._id, existingIssuanceForm.physicalStoreId) ===
          false
      ) {
        throw new Error(
          "You do not have permission to approve Issuance Forms in this Physical Store."
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
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Issuance Forms in the System."
        );
      }

      const existingIssuanceForm = IssuanceForms.findOne(_id);
      if (
        !existingIssuanceForm ||
        hasInstanceAccess(user._id, existingIssuanceForm.physicalStoreId) ===
          false
      ) {
        throw new Error(
          "You do not have permission to manage Issuance Forms in this Physical Store."
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
