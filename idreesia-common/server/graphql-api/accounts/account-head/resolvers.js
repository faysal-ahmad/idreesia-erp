import { AccountHeads } from 'meteor/idreesia-common/server/collections/accounts';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  AccountHead: {
    hasChildren: async accountHead => {
      const childCount = AccountHeads.find({
        companyId: accountHead.companyId,
        parent: accountHead.number,
      }).count();

      return childCount > 0;
    },
  },
  Query: {
    accountHeadById: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_VIEW_ACCOUNT_HEADS,
          PermissionConstants.ACCOUNTS_MANAGE_ACCOUNT_HEADS,
        ])
      ) {
        return null;
      }

      const accountHead = AccountHeads.findOne({ _id });
      if (hasInstanceAccess(user, accountHead.companyId) === false) return null;
      return accountHead;
    },

    accountHeadsByCompanyId: async (obj, { companyId }, { user }) => {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_VIEW_ACCOUNT_HEADS,
          PermissionConstants.ACCOUNTS_MANAGE_ACCOUNT_HEADS,
        ])
      ) {
        return [];
      }

      return AccountHeads.find({ companyId: { $eq: companyId } }).fetch();
    },
  },

  Mutation: {
    updateAccountHead: async (
      obj,
      { _id, companyId, name, description, startingBalance },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_MANAGE_ACCOUNT_HEADS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Account Heads in the System.'
        );
      }

      const date = new Date();
      AccountHeads.update(
        {
          _id: { $eq: _id },
        },
        {
          $set: {
            name,
            description,
            startingBalance,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return AccountHeads.findOne(_id);
    },
  },
};
