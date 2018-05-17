import { Accounts } from 'meteor/accounts-base';
import { find, findIndex } from 'lodash';

import { Karkuns } from '/imports/lib/collections/hr';

export default {
  AccountType: {
    karkun: accountType => {
      return Karkuns.findOne({
        userId: { $eq: accountType._id }
      });
    }
  },

  Query: {
    allAccounts() {
      return Meteor.users
        .find({
          username: { $ne: 'erp-admin' }
        })
        .fetch();
    },
    accountById(obj, { id }, context) {
      return Meteor.users.findOne(id);
    },
    allkarkunsWithNoAccounts() {
      return Karkuns.find({
        userId: { $eq: null }
      }).fetch();
    }
  },

  Mutation: {
    createAccount(obj, { karkunId, userName, password }, { userId }) {
      const existingUser = Accounts.findUserByUsername(userName);
      if (existingUser) {
        throw new Error(`User name '${userName}' is already in use.`);
      }

      const newUserId = Accounts.createUser({
        username: userName,
        password
      });

      const time = Date.now();
      Karkuns.update(karkunId, {
        $set: {
          userId: newUserId,
          updatedAt: time
        }
      });

      return Accounts.findUserByUsername(userName);
    },

    deleteAccount(obj, { karkunId, karkunUserId }, { userId }) {
      const time = Date.now();
      Karkuns.update(karkunId, {
        $set: {
          userId: null,
          updatedAt: time
        }
      });

      return Meteor.users.remove(karkunUserId);
    },

    addPermission(obj, { moduleName, permissionName }, { userId }) {
      const user = Meteor.users.findOne(userId);
      const { permissions } = user.permissions || [];
      const existingPermission = find(permissions, { moduleName, permissionName });
      if (!existingPermission) {
        permissions.push({ moduleName, permissionName });
        Meteor.users.update(userId, { $set: { permissions } });
      }

      return Meteor.users.findOne(userId);
    },

    removePermission(obj, { moduleName, permissionName }, { userId }) {
      const user = Meteor.users.findOne(userId);
      const { permissions } = user.permissions || [];
      const index = findIndex(permissions, { moduleName, permissionName });
      if (index !== -1) {
        permissions.splice(index, 1);
        Meteor.users.update(userId, { $set: { permissions } });
      }

      return Meteor.users.findOne(userId);
    }
  }
};
