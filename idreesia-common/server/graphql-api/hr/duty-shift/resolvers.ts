import {
  Duties,
  DutyShifts,
  KarkunDuties,
  Attendances,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  DutyShiftType: {
    duty: async dutyShiftType => Duties.findOneAsync(dutyShiftType.dutyId),
    canDelete: async dutyShiftType => {
      // Check if this shift is currently assigned to a karkun
      const karkunDutiesCount = await KarkunDuties.find({
        shiftId: { $eq: dutyShiftType._id },
      }).countAsync();
      if (karkunDutiesCount > 0) return false;

      // Check if we have marked attendance against this shift
      const attendanceCount = await Attendances.find({
        shiftId: { $eq: dutyShiftType._id },
      }).countAsync();
      if (attendanceCount > 0) return false;

      return true;
    },
  },

  Query: {
    allDutyShifts: async () =>
      DutyShifts.find({}, { sort: { dutyId: 1 } }).fetchAsync(),

    dutyShiftsByDutyId: async (obj, { dutyId }) =>
      DutyShifts.find({
        dutyId,
      }).fetchAsync(),

    dutyShiftById: async (obj, { id }) => DutyShifts.findOneAsync(id),
  },

  Mutation: {
    createDutyShift: async (
      obj,
      { name, dutyId, startTime, endTime, attendanceSheet },
      { user }
    ) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Shifts Setup Data in the System.'
        );
      }

      const date = new Date();
      const dutyShiftId = await DutyShifts.insertAsync({
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

      return DutyShifts.findOneAsync(dutyShiftId);
    },

    updateDutyShift: async (
      obj,
      { _id, name, dutyId, startTime, endTime, attendanceSheet },
      { user }
    ) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Shifts Setup Data in the System.'
        );
      }

      const date = new Date();
      await DutyShifts.updateAsync(_id, {
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

      return DutyShifts.findOneAsync(_id);
    },

    removeDutyShift: async (obj, { _id }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Shifts Setup Data in the System.'
        );
      }

      const usedCount = await KarkunDuties.find({
        shiftId: { $eq: _id },
      }).countAsync();

      if (usedCount > 0) {
        throw new Error(
          'This shift cannot be deleted as it is currently in use.'
        );
      }

      return DutyShifts.removeAsync(_id);
    },
  },
};

export default resolvers;
