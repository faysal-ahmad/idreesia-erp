import { values } from 'lodash';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    userById(obj, { _id }) {
      const user = Meteor.users.findOne(_id);
      if (user.username !== 'erp-admin') return user;

      const adminUser = Object.assign({}, user);
      adminUser.permissions = values(PermissionConstants);
      return adminUser;
    },
  },

  Mutation: {
    createAccount(obj, { karkunId, userName, password, email }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          'You do not have permission to manage Accounts in the System.'
        );
      }

      if (userName) {
        const existingUser = Accounts.findUserByUsername(userName);
        if (existingUser) {
          throw new Error(`User name '${userName}' is already in use.`);
        }
      }

      const existingkarkun = Karkuns.findOne(karkunId);
      if (existingkarkun.userId) {
        throw new Error(`This karkun already has a user account.`);
      }

      const newUserId = Accounts.createUser({
        username: userName,
        email,
        password,
      });

      const time = Date.now();
      Karkuns.update(karkunId, {
        $set: {
          userId: newUserId,
          updatedAt: time,
        },
      });

      return Karkuns.findOne(karkunId);
    },

    updateAccount(obj, { userId, password, email }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          'You do not have permission to manage Accounts in the System.'
        );
      }

      if (password) {
        Accounts.setPassword(userId, password);
      }

      if (email) {
        Meteor.users.update(userId, {
          $set: {
            'emails.0.address': email,
          },
        });
      } else {
        Meteor.users.update(userId, {
          $unset: {
            emails: '',
          },
        });
      }

      return Karkuns.findOne({ userId });
    },

    deleteAccount(obj, { karkunId, karkunUserId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          'You do not have permission to manage Accounts in the System.'
        );
      }

      const time = Date.now();
      Karkuns.update(karkunId, {
        $set: {
          userId: null,
          updatedAt: time,
        },
      });

      return Meteor.users.remove(karkunUserId);
    },

    setPermissions(obj, { karkunId, karkunUserId, permissions }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          'You do not have permission to manage Accounts in the System.'
        );
      }

      Meteor.users.update(karkunUserId, { $set: { permissions } });
      return Karkuns.findOne(karkunId);
    },

    setInstanceAccess(obj, { karkunId, karkunUserId, instances }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          'You do not have permission to manage Accounts in the System.'
        );
      }

      Meteor.users.update(karkunUserId, { $set: { instances } });
      return Karkuns.findOne(karkunId);
    },
  },
};
