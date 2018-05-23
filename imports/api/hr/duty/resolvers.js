import { get } from 'lodash';

import { Duties, Karkuns, KarkunDuties } from '/imports/lib/collections/hr';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

export default {
  DutyType: {
    usedCount: dutyType => {
      return KarkunDuties.find({
        dutyId: { $eq: dutyType._id }
      }).count();
    },
    createdByName: dutyType => {
      const karkun = Karkuns.findOne({
        userId: { $eq: dutyType.createdBy }
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    },
    updatedByName: dutyType => {
      const karkun = Karkuns.findOne({
        userId: { $eq: dutyType.updatedBy }
      });

      if (!karkun) return null;
      return `${karkun.firstName} ${karkun.lastName}`;
    }
  },

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
    },

    removeDuty(obj, { _id }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Duty Setup Data in the System.');
      }

      return Duties.remove(_id);
    }
  }
};
