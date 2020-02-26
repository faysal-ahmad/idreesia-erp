import { compact, values } from 'lodash';
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
    pagedUsers(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_USERS_AND_GROUPS,
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getUsers(filter);
    },

    userById(obj, { _id }, { user }) {
      if (
        !_id ||
        !user ||
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_USERS_AND_GROUPS,
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
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
      if (!user) return null;
      const _user = findOneUser(user._id);
      if (_user.username !== 'erp-admin') return _user;

      const adminUser = mapUser(_user);
      adminUser.permissions = values(PermissionConstants);
      return adminUser;
    },

    userNames(obj, { ids }) {
      const names = [];
      if (!ids) return names;

      const idsToSearch = compact(ids);
      idsToSearch.forEach(_id => {
        const user = Meteor.users.findOne(_id);
        if (user.karkunId) {
          const karkun = Karkuns.findOne(user.karkunId);
          names.push(karkun.name);
        } else {
          names.push(user.displayName);
        }
      });

      return names;
    },
  },

  Mutation: {
    createUser(
      obj,
      { userName, password, email, displayName, karkunId },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Users in the System.'
        );
      }

      if (userName) {
        const existingUser = Accounts.findUserByUsername(userName);
        if (existingUser) {
          throw new Error(`User name '${userName}' is already in use.`);
        }
      }

      if (karkunId) {
        const existingUser = Meteor.users.findOne({ karkunId });
        if (existingUser) {
          throw new Error(`This karkun already has a user account.`);
        }
      }

      let newUserId = null;
      if (userName && password) {
        newUserId = Accounts.createUser({
          username: userName,
          password,
        });

        Meteor.users.update(newUserId, {
          $set: {
            email,
            displayName,
            karkunId,
          },
        });
      } else if (email) {
        newUserId = Accounts.createUser({
          email,
        });

        Meteor.users.update(newUserId, {
          $set: {
            displayName,
            karkunId,
          },
        });
      }

      return findOneUser(newUserId);
    },

    updateUser(
      obj,
      { userId, password, email, displayName, locked, karkunId },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Users in the System.'
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
            karkunId,
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
            karkunId,
          },
        });
      }

      return findOneUser(userId);
    },

    setPermissions(obj, { userId, permissions }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Users in the System.'
        );
      }

      Meteor.users.update(userId, { $set: { permissions } });
      return findOneUser(userId);
    },

    setInstanceAccess(obj, { userId, instances }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Users in the System.'
        );
      }

      Meteor.users.update(userId, { $set: { instances } });
      return findOneUser(userId);
    },

    updateLoginTime(obj, {}, { user }) {
      if (user) {
        Meteor.users.update(user._id, {
          $set: {
            lastLoggedInAt: new Date(),
          },
        });
      }

      return 1;
    },

    updateLastActiveTime(obj, {}, { user }) {
      if (user) {
        Meteor.users.update(user._id, {
          $set: {
            lastActiveAt: new Date(),
          },
        });
      }

      return 1;
    },
  },
};
