import {
  Duties,
  DutyShifts,
  KarkunDuties,
  Attendances,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  DutyType: {
    shifts: async dutyType =>
      DutyShifts.find({
        dutyId: { $eq: dutyType._id },
      }).fetch(),
    canDelete: async dutyType => {
      // Check if this duty is currently assigned to a karkun
      const karkunDutiesCount = KarkunDuties.find({
        dutyId: { $eq: dutyType._id },
      }).count();
      if (karkunDutiesCount > 0) return false;

      // Check if we have marked attendance against this duty
      const attendanceCount = Attendances.find({
        dutyId: { $eq: dutyType._id },
      }).count();
      if (attendanceCount > 0) return false;

      return true;
    },
  },

  Query: {
    allMSDuties: async () =>
      Duties.find(
        { isMehfilDuty: { $eq: false } },
        { sort: { name: 1 } }
      ).fetch(),

    allMehfilDuties: async () =>
      Duties.find(
        { isMehfilDuty: { $eq: true } },
        { sort: { name: 1 } }
      ).fetch(),

    dutyById: async (obj, { id }) => Duties.findOne(id),
  },

  Mutation: {
    createDuty: async (
      obj,
      { name, isMehfilDuty, description, attendanceSheet },
      { user }
    ) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Setup Data in the System.'
        );
      }

      const date = new Date();
      const dutyId = Duties.insert({
        name,
        isMehfilDuty,
        description,
        attendanceSheet,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Duties.findOne(dutyId);
    },

    updateDuty: async (
      obj,
      { id, name, description, attendanceSheet },
      { user }
    ) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Setup Data in the System.'
        );
      }

      const date = new Date();
      Duties.update(id, {
        $set: {
          name,
          description,
          attendanceSheet,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Duties.findOne(id);
    },

    removeDuty: async (obj, { _id }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Setup Data in the System.'
        );
      }

      return Duties.remove(_id);
    },
  },
};
