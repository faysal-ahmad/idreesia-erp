import { compact, values } from 'meteor/idreesia-common/utilities/lodash';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { createJob } from 'meteor/idreesia-common/server/utilities/jobs';
import { DataSource, JobTypes } from 'meteor/idreesia-common/constants';

export default {
  UserType: {
    person: async userType => {
      if (!userType.personId) return null;
      return People.findOne(userType.personId);
    },

    karkun: async userType => {
      if (!userType.personId) return null;
      const person = People.findOne(userType.personId);
      return People.personToKarkun(person);
    },

    portal: async userType =>
      Portals.findOne({
        _id: { $in: userType.instances },
      }),
  },

  Query: {
    pagedUsers: async (obj, { filter }) => Users.searchUsers(filter),

    userById: async (obj, { _id }, { user }) => {
      if (!_id || !user) {
        return null;
      }

      const _user = Users.findOneUser(_id);
      if (_user.username === 'erp-admin') {
        _user.permissions = values(PermissionConstants);
      }

      return _user;
    },

    currentUser: async (obj, {}, { user }) => {
      if (!user) return null;
      const _user = Users.findOneUser(user._id);
      if (_user.username === 'erp-admin') {
        _user.permissions = values(PermissionConstants);
      }

      return _user;
    },

    userNames: async (obj, { ids }) => {
      const names = [];
      if (!ids) return names;

      const idsToSearch = compact(ids);
      idsToSearch.forEach(_id => {
        const user = Users.findOne(_id);
        if (user.personId) {
          const person = People.findOne(user.personId);
          names.push(person.sharedData.name);
        } else {
          names.push(user.displayName);
        }
      });

      return names;
    },
  },

  Mutation: {
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
        Users.update(user._id, {
          $set: {
            lastLoggedInAt: loginTime,
          },
        });

        // Send sms message to user on successful login
        const params = { userId: user._id, loginTime };
        const options = { priority: 'normal', retry: 10 };
        createJob({ type: JobTypes.SEND_LOGIN_SMS_MESSAGE, params, options });

        // Create a security log
        SecurityLogs.insert({
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
