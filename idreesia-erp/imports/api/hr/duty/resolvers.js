import {
  Duties,
  DutyShifts,
  Karkuns,
  KarkunDuties,
} from "meteor/idreesia-common/collections/hr";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  DutyType: {
    shifts: dutyType =>
      DutyShifts.find({
        dutyId: { $eq: dutyType._id },
      }).fetch(),
    usedCount: dutyType =>
      KarkunDuties.find({
        dutyId: { $eq: dutyType._id },
      }).count(),
    createdByName: dutyType => {
      const karkun = Karkuns.findOne({
        userId: { $eq: dutyType.createdBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    updatedByName: dutyType => {
      const karkun = Karkuns.findOne({
        userId: { $eq: dutyType.updatedBy },
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
  },

  Query: {
    allDuties() {
      return Duties.find({}, { sort: { name: 1 } }).fetch();
    },
    dutyById(obj, { id }) {
      return Duties.findOne(id);
    },
  },

  Mutation: {
    createDuty(obj, { name }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Setup Data in the System."
        );
      }

      const date = new Date();
      const dutyId = Duties.insert({
        name,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Duties.findOne(dutyId);
    },

    updateDuty(obj, { id, name }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Setup Data in the System."
        );
      }

      const date = new Date();
      Duties.update(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Duties.findOne(id);
    },

    removeDuty(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Setup Data in the System."
        );
      }

      return Duties.remove(_id);
    },
  },
};
