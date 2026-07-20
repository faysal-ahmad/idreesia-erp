import { Accounts } from 'meteor/accounts-base';
import { compact, values } from 'meteor/idreesia-common/utilities/lodash';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  UserType: {
    person: async userType => {
      if (!userType.personId) return null;
      return People.findOneAsync(userType.personId);
    },

    karkun: async userType => {
      if (!userType.personId) return null;
      const person = await People.findOneAsync(userType.personId);
      return People.personToKarkun(person);
    },
  },

  Query: {
    pagedUsers: async (obj, { filter }) => Users.searchUsers(filter),

    userById: async (obj, { _id }, { user }) => {
      if (!_id || !user) {
        return null;
      }

      const _user = await Users.findOneUser(_id);
      if (_user.username === 'erp-admin') {
        _user.permissions = values(PermissionConstants);
      }

      return _user;
    },

    currentUser: async (obj, {}, { user }) => {
      if (!user) return null;
      const _user = await Users.findOneUser(user._id);
      if (_user.username === 'erp-admin') {
        _user.permissions = values(PermissionConstants);
      }

      return _user;
    },

    userNames: async (obj, { ids }) => {
      const names = [];
      if (!ids) return names;

      const idsToSearch = compact(ids);
      for (const _id of idsToSearch) {
        const user = await Users.findOneAsync(_id);
        if (user.personId) {
          const person = await People.findOneAsync(user.personId);
          names.push(person.sharedData.name);
        } else {
          names.push(user.displayName);
        }
      }

      return names;
    },
  },

  Mutation: {
    registerUser: async (obj, { displayName, email }) => {
      // Check if this email is already registered for a user
      const user = await Accounts.findUserByEmail(email);
      if (user) {
        throw new Error('This email address is already registered.');
      }

      const userId = await Accounts.createUserAsync({
        email,
        profile: {
          name: displayName,
        },
      });

      if (userId) {
        await Accounts.sendEnrollmentEmail(userId);
      }

      return 1;
    },

    createUser: async (obj, params, { user }) =>
      Users.createUser(params, user, DataSource.ADMIN),

    updateUser: async (obj, params, { user }) =>
      Users.updateUser(params, user, DataSource.ADMIN),

    setPermissions: async (obj, params, { user }) =>
      Users.setPermissions(params, user, DataSource.ADMIN),

    setInstanceAccess: async (obj, params, { user }) =>
      Users.setInstanceAccess(params, user, DataSource.ADMIN),

    setGroups: async (obj, params, { user }) =>
      Users.setGroups(params, user, DataSource.ADMIN),

    resetPassword: async (obj, params, { user }) =>
      Users.resetPassword(params, user, DataSource.ADMIN),

    updateLoginTime: async (obj, {}, { user }) => {
      if (user) {
        const loginTime = new Date();
        await Users.updateAsync(user._id, {
          $set: {
            lastLoggedInAt: loginTime,
          },
        });

        // Create a security log
        await SecurityLogs.insertAsync({
          userId: user._id,
          operationType: SecurityOperationType.LOGIN,
          operationTime: new Date(),
          dataSource: DataSource.ADMIN,
          dataSourceDetail: null,
        });
      }

      return 1;
    },

    updateLastActiveTime: async (obj, {}, { user }) => {
      if (user) {
        await Users.updateAsync(user._id, {
          $set: {
            lastActiveAt: new Date(),
          },
        });
      }

      return 1;
    },
  },
};
