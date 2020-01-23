import { values } from 'lodash';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getUsers } from './queries';
import { findOneUser, mapUser } from './helpers';

export default {
  UserType: {
    karkun: userType => {
      if (!userType.karkunId) return null;
      return Karkuns.findOne(userType.karkunId);
    },
  },

  Query: {
    pagedUsers(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_ACCOUNTS,
          PermissionConstants.ADMIN_MANAGE_ACCOUNTS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getUsers(queryString);
    },

    userById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_ACCOUNTS,
          PermissionConstants.ADMIN_MANAGE_ACCOUNTS,
        ])
      ) {
        return null;
      }

      const _user = findOneUser(_id);
      if (_user.username !== 'erp-admin') return _user;

      const adminUser = mapUser(_user);
      adminUser.permissions = values(PermissionConstants);
      return adminUser;
    },

    currentUser(obj, {}, { user }) {
      const _user = findOneUser(user._id);
      if (_user.username !== 'erp-admin') return _user;

      const adminUser = mapUser(_user);
      adminUser.permissions = values(PermissionConstants);
      return adminUser;
    },
  },

  Mutation: {
    createUser(
      obj,
      { userName, password, email, displayName, karkunId },
      { user }
    ) {
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

      const existingUser = Meteor.users.findOne({ karkunId });
      if (existingUser) {
        throw new Error(`This karkun already has a user account.`);
      }

      const newUserId = Accounts.createUser({
        username: userName,
        email,
        password,
      });

      Meteor.users.update(newUserId, {
        $set: {
          displayName,
          karkunId,
        },
      });

      return findOneUser(newUserId);
    },

    updateUser(
      obj,
      { userId, password, email, displayName, locked },
      { user }
    ) {
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
            displayName,
            locked,
          },
        });
      } else {
        Meteor.users.update(userId, {
          $unset: {
            emails: '',
          },
          $set: {
            displayName,
            locked,
          },
        });
      }

      return findOneUser(userId);
    },

    setPermissions(obj, { userId, permissions }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          'You do not have permission to manage Accounts in the System.'
        );
      }

      Meteor.users.update(userId, { $set: { permissions } });
      return findOneUser(userId);
    },

    setInstanceAccess(obj, { userId, instances }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          'You do not have permission to manage Accounts in the System.'
        );
      }

      Meteor.users.update(userId, { $set: { instances } });
      return findOneUser(userId);
    },
  },
};
