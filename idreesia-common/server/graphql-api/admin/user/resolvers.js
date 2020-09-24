import { compact, values } from 'meteor/idreesia-common/utilities/lodash';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { createJob } from 'meteor/idreesia-common/server/utilities/jobs';
import { DataSource, JobTypes } from 'meteor/idreesia-common/constants';

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
    pagedUsers(obj, { filter }) {
      return Users.searchUsers(filter);
    },

    userById(obj, { _id }, { user }) {
      if (!_id || !user) {
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
    createUser(obj, params, { user }) {
      return Users.createUser(params, user, DataSource.ADMIN);
    },

    updateUser(obj, params, { user }) {
      return Users.updateUser(params, user, DataSource.ADMIN);
    },

    setPermissions(obj, params, { user }) {
      return Users.setPermissions(params, user, DataSource.ADMIN);
    },

    setInstanceAccess(obj, params, { user }) {
      return Users.setInstanceAccess(params, user, DataSource.ADMIN);
    },

    updateLoginTime(obj, {}, { user }) {
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
