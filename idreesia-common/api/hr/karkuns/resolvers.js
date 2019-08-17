import { compact, values } from "lodash";
import {
  Jobs,
  Duties,
  Karkuns,
  KarkunDuties
} from "meteor/idreesia-common/collections/hr";
import { Attachments } from "meteor/idreesia-common/collections/common";
import { hasOnePermission } from "meteor/idreesia-common/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import { getKarkuns, getKarkunsByDutyId } from "./queries";

export default {
  KarkunType: {
    name: karkunType => `${karkunType.firstName} ${karkunType.lastName || ""}`,
    user: karkunType => {
      if (!karkunType.userId) return null;
      return Meteor.users.findOne(karkunType.userId);
    },
    job: karkunType => {
      if (!karkunType.jobId) return null;
      return Jobs.findOne(karkunType.jobId);
    },
    duties: karkunType => {
      const karkunDuties = KarkunDuties.find({
        karkunId: { $eq: karkunType._id }
      }).fetch();

      if (karkunDuties.length > 0) {
        const dutyIds = karkunDuties.map(karkunDuty => karkunDuty.dutyId);
        const duties = Duties.find({
          _id: { $in: dutyIds }
        }).fetch();

        const dutyNames = duties.map(duty => duty.name);
        return dutyNames.join(", ");
      }
      return null;
    },
    attachments: karkunType => {
      const { attachmentIds } = karkunType;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetch();
      }

      return [];
    }
  },

  Query: {
    userById(obj, { _id }) {
      const user = Meteor.users.findOne(_id);
      if (user.username !== "erp-admin") return user;

      const adminUser = Object.assign({}, user);
      adminUser.permissions = values(PermissionConstants);
      return adminUser;
    },

    allKarkunsWithAccounts(obj, params, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_VIEW_ACCOUNTS])
      ) {
        return [];
      }

      return Karkuns.find({
        userId: { $ne: null }
      }).fetch();
    },

    pagedKarkuns(obj, { queryString }) {
      return getKarkuns(queryString);
    },

    karkunById(obj, { _id }) {
      return Karkuns.findOne(_id);
    },

    karkunsByDutyId(obj, { dutyId }) {
      return getKarkunsByDutyId(dutyId);
    },

    karkunByUserId(obj, { userId }) {
      return Karkuns.findOne({
        userId: { $eq: userId }
      });
    },

    karkunNames(obj, { ids }) {
      const names = [];
      if (!ids) return names;

      const idsToSearch = compact(ids);
      idsToSearch.forEach(id => {
        const karkun = Karkuns.findOne({
          userId: { $eq: id }
        });

        if (karkun) {
          names.push(`${karkun.firstName} ${karkun.lastName}`);
        } else {
          const user = Meteor.users.findOne(id);
          if (user.username === "erp-admin") {
            names.push("ERP Admin");
          } else {
            names.push("Unknown User");
          }
        }
      });

      return names;
    }
  },

  Mutation: {
    createKarkun(
      obj,
      {
        firstName,
        lastName,
        ehadDate,
        cnicNumber,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
        bloodGroup
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          "You do not have permission to manage Karkuns in the System."
        );
      }

      if (cnicNumber) {
        const existingKarkun = Karkuns.findOne({
          cnicNumber: { $eq: cnicNumber }
        });
        if (existingKarkun) {
          throw new Error(
            `This CNIC number is already set for ${existingKarkun.firstName} ${
              existingKarkun.lastName
            }.`
          );
        }
      }

      const date = new Date();
      const karkunId = Karkuns.insert({
        firstName,
        lastName,
        ehadDate,
        cnicNumber,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
        bloodGroup,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id
      });

      return Karkuns.findOne(karkunId);
    },

    updateKarkun(
      obj,
      {
        _id,
        firstName,
        lastName,
        ehadDate,
        cnicNumber,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
        bloodGroup
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          "You do not have permission to manage Karkuns in the System."
        );
      }

      if (cnicNumber) {
        const existingKarkun = Karkuns.findOne({
          cnicNumber: { $eq: cnicNumber }
        });
        if (existingKarkun && existingKarkun._id !== _id) {
          throw new Error(
            `This CNIC number is already set for ${existingKarkun.firstName} ${
              existingKarkun.lastName
            }.`
          );
        }
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          firstName,
          lastName,
          ehadDate,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          emailAddress,
          address,
          city,
          country,
          bloodGroup,
          updatedAt: date,
          updatedBy: user._id
        }
      });

      return Karkuns.findOne(_id);
    },

    deleteKarkun(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          "You do not have permission to manage Karkuns in the System."
        );
      }

      KarkunDuties.remove({ karkunId: _id });
      return Karkuns.remove(_id);
    },

    setKarkunEmploymentInfo(
      obj,
      {
        _id,
        isEmployee,
        jobId,
        employmentStartDate,
        employmentEndDate,
        currentSalary
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          "You do not have permission to manage Karkuns in the System."
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          isEmployee,
          jobId,
          employmentStartDate,
          employmentEndDate,
          currentSalary,
          updatedAt: date,
          updatedBy: user._id
        }
      });

      return Karkuns.findOne(_id);
    },

    setKarkunProfileImage(obj, { _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          "You do not have permission to manage Karkuns in the System."
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          imageId,
          updatedAt: date,
          updatedBy: user._id
        }
      });

      return Karkuns.findOne(_id);
    },

    addKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          "You do not have permission to manage Karkuns in the System."
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $addToSet: {
          attachmentIds: attachmentId
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id
        }
      });

      return Karkuns.findOne(_id);
    },

    removeKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          "You do not have permission to manage Karkuns in the System."
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $pull: {
          attachmentIds: attachmentId
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id
        }
      });

      Attachments.remove(attachmentId);
      return Karkuns.findOne(_id);
    },

    createAccount(obj, { karkunId, userName, password }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          "You do not have permission to manage Accounts in the System."
        );
      }

      const existingUser = Accounts.findUserByUsername(userName);
      if (existingUser) {
        throw new Error(`User name '${userName}' is already in use.`);
      }

      const existingkarkun = Karkuns.findOne(karkunId);
      if (existingkarkun.userId) {
        throw new Error(`This karkun already has a user account.`);
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

      return Karkuns.findOne(karkunId);
    },

    deleteAccount(obj, { karkunId, karkunUserId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          "You do not have permission to manage Accounts in the System."
        );
      }

      const time = Date.now();
      Karkuns.update(karkunId, {
        $set: {
          userId: null,
          updatedAt: time
        }
      });

      return Meteor.users.remove(karkunUserId);
    },

    setPermissions(obj, { karkunId, karkunUserId, permissions }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_ACCOUNTS])
      ) {
        throw new Error(
          "You do not have permission to manage Accounts in the System."
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
          "You do not have permission to manage Accounts in the System."
        );
      }

      Meteor.users.update(karkunUserId, { $set: { instances } });
      return Karkuns.findOne(karkunId);
    }
  }
};