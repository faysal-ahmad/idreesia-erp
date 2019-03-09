import { AccountHeads } from "meteor/idreesia-common/collections/accounts";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  AccountHead: {
    hasChildren: accountHead => {
      const childCount = AccountHeads.find({
        companyId: accountHead.companyId,
        parent: accountHead.number,
      }).count();

      return childCount > 0;
    },
  },
  Query: {
    accountHeadById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_ACCOUNT_HEADS,
          PermissionConstants.ACCOUNTS_MANAGE_ACCOUNT_HEADS,
        ])
      ) {
        return null;
      }

      return AccountHeads.findOne({ _id });
    },
    accountHeadsByCompanyId(obj, { companyId }, { user }) {
      if (
        !hasOnePermission(user._id, [
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
    updateAccountHead(
      obj,
      { _id, name, description, startingBalance },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_ACCOUNT_HEADS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Account Heads in the System."
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
