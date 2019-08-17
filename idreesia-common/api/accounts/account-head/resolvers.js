import { AccountHeads } from "meteor/idreesia-common/collections/accounts";
import {
  hasInstanceAccess,
  hasOnePermission
} from "meteor/idreesia-common/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  AccountHead: {
    hasChildren: accountHead => {
      const childCount = AccountHeads.find({
        companyId: accountHead.companyId,
        parent: accountHead.number
      }).count();

      return childCount > 0;
    }
  },
  Query: {
    accountHeadById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_ACCOUNT_HEADS,
          PermissionConstants.ACCOUNTS_MANAGE_ACCOUNT_HEADS
        ])
      ) {
        return null;
      }

      const accountHead = AccountHeads.findOne({ _id });
      if (hasInstanceAccess(user._id, accountHead.companyId) === false)
        return null;
      return accountHead;
    },

    accountHeadsByCompanyId(obj, { companyId }, { user }) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_ACCOUNT_HEADS,
          PermissionConstants.ACCOUNTS_MANAGE_ACCOUNT_HEADS
        ])
      ) {
        return [];
      }

      return AccountHeads.find({ companyId: { $eq: companyId } }).fetch();
    }
  },

  Mutation: {
    updateAccountHead(
      obj,
      { _id, companyId, name, description, startingBalance },
      { user }
    ) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_ACCOUNT_HEADS
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Account Heads in the System."
        );
      }

      const date = new Date();
      AccountHeads.update(
        {
          _id: { $eq: _id }
        },
        {
          $set: {
            name,
            description,
            startingBalance,
            updatedAt: date,
            updatedBy: user._id
          }
        }
      );

      return AccountHeads.findOne(_id);
    }
  }
};
