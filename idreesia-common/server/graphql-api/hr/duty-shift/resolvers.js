import {
  Duties,
  DutyShifts,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  DutyShiftType: {
    duty: dutyShiftType => Duties.findOne(dutyShiftType.dutyId),
    usedCount: dutyShiftType =>
      KarkunDuties.find({
        shiftId: { $eq: dutyShiftType._id },
      }).count(),
  },

  Query: {
    allDutyShifts() {
      return DutyShifts.find({}, { sort: { dutyId: 1 } }).fetch();
    },

    dutyShiftsByDutyId(obj, { dutyId }) {
      return DutyShifts.find({
        dutyId,
      }).fetch();
    },

    dutyShiftById(obj, { id }) {
      return DutyShifts.findOne(id);
    },
  },

  Mutation: {
    createDutyShift(
      obj,
      { name, dutyId, startTime, endTime, attendanceSheet },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Duty Shifts Setup Data in the System.'
        );
      }

      const date = new Date();
      const dutyShiftId = DutyShifts.insert({
        name,
        dutyId,
        startTime,
        endTime,
        attendanceSheet,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return DutyShifts.findOne(dutyShiftId);
    },

    updateDutyShift(
      obj,
      { id, name, dutyId, startTime, endTime, attendanceSheet },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Duty Shifts Setup Data in the System.'
        );
      }

      const date = new Date();
      DutyShifts.update(id, {
        $set: {
          name,
          dutyId,
          startTime,
          endTime,
          attendanceSheet,
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
          'You do not have permission to manage Duty Shifts Setup Data in the System.'
        );
      }

      const usedCount = KarkunDuties.find({
        shiftId: { $eq: _id },
      }).count();

      if (usedCount > 0) {
        throw new Error(
          'This shift cannot be deleted as it is currently in use.'
        );
      }

      return DutyShifts.remove(_id);
    },
  },
};
