import { ImdadRequests } from 'meteor/idreesia-common/server/collections/accounts';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

export default {
  Query: {
    accountsImdadRequestById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_IMDAD_REQUESTS,
          PermissionConstants.ACCOUNTS_MANAGE_IMDAD_REQUESTS,
        ])
      ) {
        return null;
      }

      return ImdadRequests.findOne(_id);
    },

    pagedAccountsImdadRequests(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_IMDAD_REQUESTS,
          PermissionConstants.ACCOUNTS_MANAGE_IMDAD_REQUESTS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return ImdadRequests.getPagedData(filter);
    },
  },

  Mutation: {
    createAccountsImdadRequest(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_IMDAD_REQUESTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Imdad Requests in the System.'
        );
      }

      return ImdadRequests.createImdadRequest(
        {
          dataSource: DataSource.ACCOUNTS,
          ...values,
        },
        user
      );
    },

    updateAccountsImdadRequest(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_IMDAD_REQUESTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Payments in the System.'
        );
      }

      return ImdadRequests.updateImdadRequest(values, user);
    },

    deleteAccountsImdadRequest(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ACCOUNTS_DELETE_DATA])
      ) {
        throw new Error(
          'You do not have permission to delete Imdad Requests in the System.'
        );
      }

      return ImdadRequests.remove(_id);
    },

    setAccountsApprovedImdad(obj, { _id, approvedImdad }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_IMDAD_REQUESTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Imdad Requests in the System.'
        );
      }

      const date = new Date();
      ImdadRequests.update(
        {
          _id,
        },
        {
          $set: {
            approvedImdad,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return ImdadRequests.findOne(_id);
    },

    addAccountsImdadRequestAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_IMDAD_REQUESTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Imdad Requests in the System.'
        );
      }

      const date = new Date();
      ImdadRequests.update(
        {
          _id,
        },
        {
          $addToSet: {
            attachmentIds: attachmentId,
          },
          $set: {
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return ImdadRequests.findOne(_id);
    },

    removeAccountsImdadRequestAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_IMDAD_REQUESTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Imdad Requests in the System.'
        );
      }

      const date = new Date();
      ImdadRequests.update(
        { _id },
        {
          $pull: {
            attachmentIds: attachmentId,
          },
          $set: {
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      Attachments.remove(attachmentId);
      return ImdadRequests.findOne(_id);
    },
  },
};
