import {
  Duties,
  DutyShifts,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

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
    createDuty(obj, { name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Duty Setup Data in the System.'
        );
      }

      const date = new Date();
      const dutyId = Duties.insert({
        name,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Duties.findOne(dutyId);
    },

    updateDuty(obj, { id, name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Duty Setup Data in the System.'
        );
      }

      const date = new Date();
      Duties.update(id, {
        $set: {
          name,
          description,
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
          'You do not have permission to manage Duty Setup Data in the System.'
        );
      }

      return Duties.remove(_id);
    },
  },
};
