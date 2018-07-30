import { keyBy } from 'lodash';

import { Karkuns } from '/imports/lib/collections/hr';
import { IssuanceForms, PhysicalStores, StockItems } from '/imports/lib/collections/inventory';
import { filterByInstanceAccess, hasInstanceAccess, hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

import getIssuanceForms, { getIssuanceFormsByStockItemId } from './queries';

export default {
  IssuanceForm: {
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
      const filteredPhysicalStores = filterByInstanceAccess(userId, physicalStores);
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
      const filteredPhysicalStores = filterByInstanceAccess(userId, physicalStores);
      if (filteredPhysicalStores.length === 0) return [];
      const physicalStoreIds = physicalStores.map(physicalStore => physicalStore._id);

      return IssuanceForms.findOne({
        _id: { $eq: _id },
        physicalStoreId: { $in: physicalStoreIds },
      });
    },
  },

  Mutation: {
    createIssuanceForm(
      obj,
      { issueDate, issuedBy, issuedTo, physicalStoreId, items, notes },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error('You do not have permission to manage Issuance Forms in the System.');
      }

      if (hasInstanceAccess(userId, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in this Physical Store.'
        );
      }

      const date = new Date();
      const issuanceFormId = IssuanceForms.insert({
        issueDate,
        issuedBy,
        issuedTo,
        physicalStoreId,
        items,
        notes,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      items.forEach(({ stockItemId, quantity }) => {
        StockItems.decrementCurrentLevel(stockItemId, quantity);
      });

      return IssuanceForms.findOne(issuanceFormId);
    },

    updateIssuanceForm(
      obj,
      { _id, issueDate, issuedBy, issuedTo, physicalStoreId, items, notes },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error('You do not have permission to manage Issuance Forms in the System.');
      }

      if (hasInstanceAccess(userId, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in this Physical Store.'
        );
      }

      const itemsMap = keyBy(items, 'stockItemId');
      const existingForm = IssuanceForms.findOne(_id);
      const { items: existingItems } = existingForm;
      const existingItemsMap = keyBy(existingItems, 'stockItemId');

      items.forEach(({ stockItemId, quantity }) => {
        const existingItem = existingItemsMap[stockItemId];
        if (!existingItem) {
          // This item did not exist previously in the form, so just update the current
          // stock level with the specified quantity
          StockItems.decrementCurrentLevel(stockItemId, quantity);
        } else {
          // This item existed previously in the form. So update the current stock level
          // by the change in quantity
          StockItems.decrementCurrentLevel(stockItemId, quantity - existingItem.quantity);
        }
      });

      existingItems.forEach(({ stockItemId, quantity }) => {
        const item = itemsMap[stockItemId];
        if (!item) {
          // This item existed previously in the form but has been removed now. Since we
          // previously decremented the quantity for it, we need to undo that action.
          StockItems.incrementCurrentLevel(stockItemId, quantity);
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
      if (!hasOnePermission(userId, [PermissionConstants.IN_APPROVE_ISSUANCE_FORMS])) {
        throw new Error('You do not have permission to approve Issuance Forms in the System.');
      }

      const existingIssuanceForm = IssuanceForms.findOne(_id);
      if (
        !existingIssuanceForm ||
        hasInstanceAccess(userId, existingIssuanceForm.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to approve Issuance Forms in this Physical Store.'
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
        throw new Error('You do not have permission to manage Issuance Forms in the System.');
      }

      const existingIssuanceForm = IssuanceForms.findOne(_id);
      if (
        !existingIssuanceForm ||
        hasInstanceAccess(userId, existingIssuanceForm.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Issuance Forms in this Physical Store.'
        );
      }

      const existingForm = IssuanceForms.findOne(_id);
      const { items: existingItems } = existingForm;
      existingItems.forEach(({ stockItemId, quantity }) => {
        StockItems.incrementCurrentLevel(stockItemId, quantity);
      });

      return IssuanceForms.remove(_id);
    },
  },
};
