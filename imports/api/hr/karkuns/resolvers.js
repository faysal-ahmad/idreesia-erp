import { Duties, Karkuns, KarkunDuties } from '/imports/lib/collections/hr';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

export default {
  KarkunType: {
    name: karkunType => `${karkunType.firstName} ${karkunType.lastName}`,
    user: karkunType => {
      if (!karkunType.userId) return null;
      return Meteor.users.findOne(karkunType.userId);
    },
    duties: karkunType => {
      const karkunDuties = KarkunDuties.find({
        karkunId: { $eq: karkunType._id },
      }).fetch();

      if (karkunDuties.length > 0) {
        const dutyIds = karkunDuties.map(karkunDuty => karkunDuty.dutyId);
        const duties = Duties.find({
          _id: { $in: dutyIds },
        }).fetch();

        const dutyNames = duties.map(duty => duty.name);
        return dutyNames.join(', ');
      }
      return null;
    },
  },

  Query: {
    allKarkunsWithAccounts(obj, params, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_VIEW_ACCOUNTS])) {
        return [];
      }

      return Karkuns.find({
        userId: { $ne: null },
      }).fetch();
    },
    allKarkunsWithNoAccounts() {
      return Karkuns.find({
        userId: { $eq: null },
      }).fetch();
    },

    allKarkuns(obj, params, { userId }) {
      // if (!hasOnePermission(userId, [PermissionConstants.HR_VIEW_KARKUNS])) {
      //  return [];
      // }

      return Karkuns.find({}).fetch();
    },

    karkunById(obj, { _id }) {
      return Karkuns.findOne(_id);
    },

    karkunByUserId(obj, { userId }) {
      return Karkuns.findOne({
        userId: { $eq: userId },
      });
    },
  },

  Mutation: {
    createKarkun(obj, { firstName, lastName, cnicNumber, address }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error('You do not have permission to manage Karkuns in the System.');
      }

      const existingKarkun = Karkuns.findOne({ cnicNumber: { $eq: cnicNumber } });
      if (existingKarkun) {
        throw new Error(
          `This CNIC number is already set for ${existingKarkun.firstName} ${
            existingKarkun.lastName
          }.`
        );
      }

      const date = new Date();
      const karkunId = Karkuns.insert({
        firstName,
        lastName,
        cnicNumber,
        address,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return Karkuns.findOne(karkunId);
    },

    updateKarkun(obj, { _id, firstName, lastName, cnicNumber, address }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error('You do not have permission to manage Karkuns in the System.');
      }

      const existingKarkun = Karkuns.findOne({ cnicNumber: { $eq: cnicNumber } });
      if (existingKarkun && existingKarkun._id !== _id) {
        throw new Error(
          `This CNIC number is already set for ${existingKarkun.firstName} ${
            existingKarkun.lastName
          }.`
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          firstName,
          lastName,
          cnicNumber,
          address,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return Karkuns.findOne(_id);
    },

    setProfilePicture(obj, { _id, profilePicture }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_KARKUNS])) {
        throw new Error('You do not have permission to create Karkuns in the System.');
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          profilePicture,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return Karkuns.findOne(_id);
    },

    createAccount(obj, { karkunId, userName, password }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])) {
        throw new Error('You do not have permission to manage Accounts in the System.');
      }

      const existingUser = Accounts.findUserByUsername(userName);
      if (existingUser) {
        throw new Error(`User name '${userName}' is already in use.`);
      }

      const newUserId = Accounts.createUser({
        username: userName,
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

    deleteAccount(obj, { karkunId, karkunUserId }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])) {
        throw new Error('You do not have permission to manage Accounts in the System.');
      }

      const time = Date.now();
      Karkuns.update(karkunId, {
        $set: {
          userId: null,
          updatedAt: time,
        },
      });

      Meteor.users.remove(karkunUserId);
      return Karkuns.findOne(karkunId);
    },

    setPermissions(obj, { karkunId, karkunUserId, permissions }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])) {
        throw new Error('You do not have permission to manage Accounts in the System.');
      }

      Meteor.users.update(karkunUserId, { $set: { permissions } });
      return Karkuns.findOne(karkunId);
    },

    setInstanceAccess(obj, { karkunId, karkunUserId, instances }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])) {
        throw new Error('You do not have permission to manage Accounts in the System.');
      }

      Meteor.users.update(karkunUserId, { $set: { instances } });
      return Karkuns.findOne(karkunId);
    },
  },
};
