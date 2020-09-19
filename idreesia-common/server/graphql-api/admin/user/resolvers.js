import { compact, values } from 'meteor/idreesia-common/utilities/lodash';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { createJob } from 'meteor/idreesia-common/server/utilities/jobs';
import { JobTypes } from 'meteor/idreesia-common/constants';

export default {
  UserType: {
    karkun: userType => {
      if (!userType.karkunId) return null;
      return Karkuns.findOne(userType.karkunId);
    },

    portal: userType =>
      Portals.findOne({
        _id: { $in: userType.instances },
      }),
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

      return Users.searchUsers(filter);
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

      const _user = Users.findOneUser(_id);
      if (_user.username === 'erp-admin') {
        _user.permissions = values(PermissionConstants);
      }

      return _user;
    },

    currentUser(obj, {}, { user }) {
      if (!user) return null;
      const _user = Users.findOneUser(user._id);
      if (_user.username === 'erp-admin') {
        _user.permissions = values(PermissionConstants);
      }

      return _user;
    },

    userNames(obj, { ids }) {
      const names = [];
      if (!ids) return names;

      const idsToSearch = compact(ids);
      idsToSearch.forEach(_id => {
        const user = Users.findOne(_id);
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
        const existingUser = Users.findOne({ karkunId });
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

        Users.update(newUserId, {
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

        Users.update(newUserId, {
          $set: {
            displayName,
            karkunId,
          },
        });
      }

      return Users.findOneUser(newUserId);
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
        Users.update(userId, {
          $set: {
            'emails.0.address': email,
            displayName,
            locked,
            karkunId,
          },
        });
      } else {
        Users.update(userId, {
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

      return Users.findOneUser(userId);
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

      Users.update(userId, { $set: { permissions } });
      return Users.findOneUser(userId);
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

      Users.update(userId, { $set: { instances } });
      return Users.findOneUser(userId);
    },

    updateLoginTime(obj, {}, { user }) {
      if (user) {
        Users.update(user._id, {
          $set: {
            lastLoggedInAt: new Date(),
          },
        });

        const params = { userId: user._id };
        const options = { priority: 'normal', retry: 10 };
        createJob({ type: JobTypes.SEND_LOGIN_SMS_MESSAGE, params, options });
      }

      return 1;
    },

    updateLastActiveTime(obj, {}, { user }) {
      if (user) {
        Users.update(user._id, {
          $set: {
            lastActiveAt: new Date(),
          },
        });
      }

      return 1;
    },
  },
};
