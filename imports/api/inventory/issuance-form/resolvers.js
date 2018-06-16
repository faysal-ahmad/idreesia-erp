import { Karkuns } from '/imports/lib/collections/hr';
import { IssuanceForms } from '/imports/lib/collections/inventory';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

import getIssuanceForms from './queries';

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
    allIssuanceForms() {
      return IssuanceForms.find({}).fetch();
    },
    pagedIssuanceForms(obj, { queryString }) {
      return getIssuanceForms(queryString);
    },
    issuanceFormById(obj, { _id }) {
      return IssuanceForms.findOne(_id);
    },
  },

  Mutation: {
    createIssuanceForm(obj, { issueDate, issuedBy, issuedTo, physicalStoreId, items }, { userId }) {
      if (
        !hasOnePermission(userId, [
          PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
        ])
      ) {
        throw new Error('You do not have permission to manage Issuance Forms in the System.');
      }

      const date = new Date();
      const issuanceFormId = IssuanceForms.insert({
        issueDate,
        issuedBy,
        issuedTo,
        physicalStoreId,
        items,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return IssuanceForms.findOne(issuanceFormId);
    },

    updateIssuanceForm(
      obj,
      { _id, issueDate, issuedBy, issuedTo, physicalStoreId, items },
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

      return IssuanceForms.remove(_id);
    },
  },
};
