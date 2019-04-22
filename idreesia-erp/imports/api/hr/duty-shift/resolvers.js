import {
  DutyShifts,
  KarkunDuties,
} from "meteor/idreesia-common/collections/hr";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  DutyShiftType: {
    usedCount: dutyShiftType =>
      KarkunDuties.find({
        shiftId: { $eq: dutyShiftType._id },
      }).count(),
  },

  Query: {
    allDutyShifts() {
      return DutyShifts.find({}).fetch();
    },
    dutyShiftById(obj, { id }) {
      return DutyShifts.findOne(id);
    },
  },

  Mutation: {
    createDutyShift(obj, { name, startTime, endTime }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Shifts Setup Data in the System."
        );
      }

      const date = new Date();
      const dutyShiftId = DutyShifts.insert({
        name,
        startTime,
        endTime,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return DutyShifts.findOne(dutyShiftId);
    },

    updateDutyShift(obj, { id, name, startTime, endTime }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Shifts Setup Data in the System."
        );
      }

      const date = new Date();
      DutyShifts.update(id, {
        $set: {
          name,
          startTime,
          endTime,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return DutyShifts.findOne(id);
    },

    removeDutyShift(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Shifts Setup Data in the System."
        );
      }

      const usedCount = KarkunDuties.find({
        shiftId: { $eq: _id },
      }).count();

      if (usedCount > 0) {
        throw new Error(
          "This shift cannot be deleted as it is currently in use."
        );
      }

      return DutyShifts.remove(_id);
    },
  },
};
