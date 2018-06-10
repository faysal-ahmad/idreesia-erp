import { IssuanceForms } from '/imports/lib/collections/inventory';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

export default {
  Query: {
    allIssuanceForms() {
      return IssuanceForms.find({}).fetch();
    },
    pagedIssuanceForms(obj, { queryString }) {
      return {
        totalResults: IssuanceForms.find({}).count(),
        issuanceForms: IssuanceForms.find({}).fetch(),
      };
    },
    issuanceFormById(obj, { id }) {
      return IssuanceForms.findOne(id);
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

    updateIssuanceForm(obj, { id }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Inventory Setup Data in the System.');
      }

      return IssuanceForms.findOne(id);
    },

    approveIssuanceForm(obj, { id }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Inventory Setup Data in the System.');
      }

      return IssuanceForms.findOne(id);
    },

    removeIssuanceForm(obj, { id }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Inventory Setup Data in the System.');
      }

      return IssuanceForms.findOne(id);
    },
  },
};
