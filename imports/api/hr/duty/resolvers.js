import { Duties } from '/imports/lib/collections/hr';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

export default {
  Query: {
    allDuties() {
      return Duties.find({}).fetch();
    },
    dutyById(obj, { id }, context) {
      return Duties.findOne(id);
    }
  },

  Mutation: {
    createDuty(obj, { name }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Duty Setup Data in the System.');
      }

      const date = new Date();
      const dutyId = Duties.insert({
        name,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId
      });

      return Duties.findOne(dutyId);
    },

    updateDuty(obj, { id, name }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Duty Setup Data in the System.');
      }

      const date = new Date();
      Duties.update(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: userId
        }
      });

      return Duties.findOne(id);
    }
  }
};
