import { DutyLocations } from '/imports/lib/collections/hr';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

export default {
  Query: {
    allDutyLocations() {
      return DutyLocations.find({}).fetch();
    },
    dutyLocationById(obj, { id }, context) {
      return DutyLocations.findOne(id);
    }
  },

  Mutation: {
    createDutyLocation(obj, { name }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Locations Setup Data in the System.'
        );
      }

      const date = new Date();
      const dutyLocationId = DutyLocations.insert({
        name,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId
      });

      return DutyLocations.findOne(dutyLocationId);
    },

    updateDutyLocation(obj, { id, name }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Locations Setup Data in the System.'
        );
      }

      const date = new Date();
      DutyLocations.update(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: userId
        }
      });

      return DutyLocations.findOne(id);
    }
  }
};
