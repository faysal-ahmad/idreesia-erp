import { keyBy } from 'lodash';

import { Karkuns } from '/imports/lib/collections/hr';
import { PurchaseForms, StockItems } from '/imports/lib/collections/inventory';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

import getPurchaseForms, { getPurchaseFormsByStockItemId } from './queries';

export default {
  PurchaseForm: {
    receivedByName: purchaseForm => {
      const karkun = Karkuns.findOne({
        _id: { $eq: purchaseForm.receivedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    purchasedByName: purchaseForm => {
      const karkun = Karkuns.findOne({
        _id: { $eq: purchaseForm.purchasedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    createdByName: purchaseForm => {
      const karkun = Karkuns.findOne({
        userId: { $eq: purchaseForm.createdBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    updatedByName: purchaseForm => {
      const karkun = Karkuns.findOne({
        userId: { $eq: purchaseForm.updatedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    approvedByName: purchaseForm => {
      if (!purchaseForm.approvedBy) return null;

      const karkun = Karkuns.findOne({
        userId: { $eq: purchaseForm.approvedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
  },
  Query: {
    allPurchaseForms(obj, params, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return [];
      }

      return PurchaseForms.find({}).fetch();
    },

    purchaseFormsByStockItem(obj, { stockItemId }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return [];
      }

      return getPurchaseFormsByStockItemId(stockItemId);
    },

    pagedPurchaseForms(obj, { queryString }, { userId }) {
      if (
        !hasOnePermission(userId, [
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

      return getPurchaseForms(queryString);
    },
    purchaseFormById(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        return null;
      }

      return PurchaseForms.findOne(_id);
    },
  },

  Mutation: {
    createPurchaseForm(
      obj,
      { purchaseDate, receivedBy, purchasedBy, physicalStoreId, items },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error('You do not have permission to manage Purchase Forms in the System.');
      }

      const date = new Date();
      const purchaseFormId = PurchaseForms.insert({
        purchaseDate,
        receivedBy,
        purchasedBy,
        physicalStoreId,
        items,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      items.forEach(({ stockItemId, quantity }) => {
        StockItems.incrementCurrentLevel(stockItemId, quantity);
      });

      return PurchaseForms.findOne(purchaseFormId);
    },

    updatePurchaseForm(
      obj,
      { _id, purchaseDate, receivedBy, purchasedBy, physicalStoreId, items },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error('You do not have permission to manage Purchase Forms in the System.');
      }

      const itemsMap = keyBy(items, 'stockItemId');
      const existingForm = PurchaseForms.findOne(_id);
      const { items: existingItems } = existingForm;
      const existingItemsMap = keyBy(existingItems, 'stockItemId');

      items.forEach(({ stockItemId, quantity }) => {
        const existingItem = existingItemsMap[stockItemId];
        if (!existingItem) {
          // This item did not exist previously in the form, so just update the current
          // stock level with the specified quantity
          StockItems.incrementCurrentLevel(stockItemId, quantity);
        } else {
          // This item existed previously in the form. So update the current stock level
          // by the change in quantity
          StockItems.incrementCurrentLevel(stockItemId, quantity - existingItem.quantity);
        }
      });

      existingItems.forEach(({ stockItemId, quantity }) => {
        const item = itemsMap[stockItemId];
        if (!item) {
          // This item existed previously in the form but has been removed now. Since we
          // previously incremented the quantity for it, we need to undo that action.
          StockItems.decrementCurrentLevel(stockItemId, quantity);
        }
      });

      const date = new Date();
      PurchaseForms.update(
        {
          _id: { $eq: _id },
          approvedOn: { $eq: null },
          approvedBy: { $eq: null },
        },
        {
          $set: {
            purchaseDate,
            receivedBy,
            purchasedBy,
            physicalStoreId,
            items,
            updatedAt: date,
            updatedBy: userId,
          },
        }
      );

      return PurchaseForms.findOne(_id);
    },

    approvePurchaseForm(obj, { _id }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_APPROVE_PURCHASE_FORMS])) {
        throw new Error('You do not have permission to approve Purchase Forms in the System.');
      }

      const date = new Date();
      PurchaseForms.update(_id, {
        $set: {
          approvedOn: date,
          approvedBy: userId,
        },
      });

      return PurchaseForms.findOne(_id);
    },

    removePurchaseForm(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
        ])
      ) {
        throw new Error('You do not have permission to manage Purchase Forms in the System.');
      }

      const existingForm = PurchaseForms.findOne(_id);
      const { items: existingItems } = existingForm;
      existingItems.forEach(({ stockItemId, quantity }) => {
        StockItems.decrementCurrentLevel(stockItemId, quantity);
      });

      return PurchaseForms.remove(_id);
    },
  },
};
