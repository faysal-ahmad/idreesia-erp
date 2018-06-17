import { Karkuns } from '/imports/lib/collections/hr';
import { ReturnForms } from '/imports/lib/collections/inventory';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

import getReturnForms, { getReturnFormsByStockItemId } from './queries';

export default {
  ReturnForm: {
    receivedByName: returnForm => {
      const karkun = Karkuns.findOne({
        _id: { $eq: returnForm.receivedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    returnedByName: returnForm => {
      const karkun = Karkuns.findOne({
        _id: { $eq: returnForm.returnedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    createdByName: returnForm => {
      const karkun = Karkuns.findOne({
        userId: { $eq: returnForm.createdBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    updatedByName: returnForm => {
      const karkun = Karkuns.findOne({
        userId: { $eq: returnForm.updatedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    approvedByName: returnForm => {
      if (!returnForm.approvedBy) return null;

      const karkun = Karkuns.findOne({
        userId: { $eq: returnForm.approvedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
  },
  Query: {
    allReturnForms(obj, params, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_RETURN_FORMS,
          PermissionConstants.IN_MANAGE_RETURN_FORMS,
          PermissionConstants.IN_APPROVE_RETURN_FORMS,
        ])
      ) {
        return [];
      }

      return ReturnForms.find({}).fetch();
    },

    returnFormsByStockItem(obj, { stockItemId }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_RETURN_FORMS,
          PermissionConstants.IN_MANAGE_RETURN_FORMS,
          PermissionConstants.IN_APPROVE_RETURN_FORMS,
        ])
      ) {
        return [];
      }

      return getReturnFormsByStockItemId(stockItemId);
    },

    pagedReturnForms(obj, { queryString }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_RETURN_FORMS,
          PermissionConstants.IN_MANAGE_RETURN_FORMS,
          PermissionConstants.IN_APPROVE_RETURN_FORMS,
        ])
      ) {
        return {
          returnForms: [],
          totalResults: 0,
        };
      }

      return getReturnForms(queryString);
    },
    returnFormById(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_VIEW_RETURN_FORMS,
          PermissionConstants.IN_MANAGE_RETURN_FORMS,
          PermissionConstants.IN_APPROVE_RETURN_FORMS,
        ])
      ) {
        return null;
      }

      return ReturnForms.findOne(_id);
    },
  },

  Mutation: {
    createReturnForm(
      obj,
      { returnDate, receivedBy, returnedBy, physicalStoreId, items },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_RETURN_FORMS,
          PermissionConstants.IN_APPROVE_RETURN_FORMS,
        ])
      ) {
        throw new Error('You do not have permission to manage Return Forms in the System.');
      }

      const date = new Date();
      const returnFormId = ReturnForms.insert({
        returnDate,
        receivedBy,
        returnedBy,
        physicalStoreId,
        items,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return ReturnForms.findOne(returnFormId);
    },

    updateReturnForm(
      obj,
      { _id, returnDate, receivedBy, returnedBy, physicalStoreId, items },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_RETURN_FORMS,
          PermissionConstants.IN_APPROVE_RETURN_FORMS,
        ])
      ) {
        throw new Error('You do not have permission to manage Return Forms in the System.');
      }

      const date = new Date();
      ReturnForms.update(
        {
          _id: { $eq: _id },
          approvedOn: { $eq: null },
          approvedBy: { $eq: null },
        },
        {
          $set: {
            returnDate,
            receivedBy,
            returnedBy,
            physicalStoreId,
            items,
            updatedAt: date,
            updatedBy: userId,
          },
        }
      );

      return ReturnForms.findOne(_id);
    },

    approveReturnForm(obj, { _id }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_APPROVE_RETURN_FORMS])) {
        throw new Error('You do not have permission to approve Return Forms in the System.');
      }

      const date = new Date();
      ReturnForms.update(_id, {
        $set: {
          approvedOn: date,
          approvedBy: userId,
        },
      });

      return ReturnForms.findOne(_id);
    },

    removeReturnForm(obj, { _id }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_RETURN_FORMS,
          PermissionConstants.IN_APPROVE_RETURN_FORMS,
        ])
      ) {
        throw new Error('You do not have permission to manage Return Forms in the System.');
      }

      return ReturnForms.remove(_id);
    },
  },
};
