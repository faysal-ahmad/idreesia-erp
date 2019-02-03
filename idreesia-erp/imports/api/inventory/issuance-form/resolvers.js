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
    refCreatedBy: issuanceForm =>
      Karkuns.findOne({
        _id: { $eq: issuanceForm.createdBy },
      }),
    refUpdatedBy: issuanceForm =>
      Karkuns.findOne({
        _id: { $eq: issuanceForm.updatedBy },
      }),
    issuedByName: issuanceForm => {
      const karkun = Karkuns.findOne({
        _id: { $eq: issuanceForm.issuedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    issuedToName: issuanceForm => {
      const karkun = Karkuns.findOne({
        _id: { $eq: issuanceForm.issuedTo },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    createdByName: issuanceForm => {
      const karkun = Karkuns.findOne({
        userId: { $eq: issuanceForm.createdBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    updatedByName: issuanceForm => {
      const karkun = Karkuns.findOne({
        userId: { $eq: issuanceForm.updatedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    approvedByName: issuanceForm => {
      if (!issuanceForm.approvedBy) return null;

      const karkun = Karkuns.findOne({
        userId: { $eq: issuanceForm.approvedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
  },
  Query: {
    issuanceFormsByStockItem(obj, { stockItemId }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
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

      return getIssuanceFormsByStockItemId(stockItemId, filteredPhysicalStores);
    },

    pagedIssuanceForms(obj, { physicalStoreId, queryString }, { userId }) {
      if (
        hasInstanceAccess(userId, physicalStoreId) === false ||
        !hasOnePermission(userId, [
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

    issuanceFormById(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
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
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Issuance Forms in the System."
        );
      }

      if (hasInstanceAccess(userId, physicalStoreId) === false) {
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
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Issuance Forms in the System."
        );
      }

      if (hasInstanceAccess(userId, physicalStoreId) === false) {
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
            updatedBy: userId,
          },
        }
      );

      return IssuanceForms.findOne(_id);
    },

    approveIssuanceForm(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
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
        hasInstanceAccess(userId, existingIssuanceForm.physicalStoreId) ===
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
          approvedBy: userId,
        },
      });

      return IssuanceForms.findOne(_id);
    },

    removeIssuanceForm(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
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
        hasInstanceAccess(userId, existingIssuanceForm.physicalStoreId) ===
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
