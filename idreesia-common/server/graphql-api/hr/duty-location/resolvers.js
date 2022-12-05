import {
  DutyLocations,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  DutyLocationType: {
    usedCount: async dutyLocationType =>
      KarkunDuties.find({
        locationId: { $eq: dutyLocationType._id },
      }).count(),
  },

  Query: {
    allDutyLocations: async () => DutyLocations.find({}).fetch(),
    dutyLocationById: async (obj, { id }) => DutyLocations.findOne(id),
  },

  Mutation: {
    createDutyLocation: async (obj, { name }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Locations Setup Data in the System.'
        );
      }

      const date = new Date();
      const dutyLocationId = DutyLocations.insert({
        name,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return DutyLocations.findOne(dutyLocationId);
    },

    updateDutyLocation: async (obj, { id, name }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Locations Setup Data in the System.'
        );
      }

      const date = new Date();
      DutyLocations.update(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return DutyLocations.findOne(id);
    },

    removeDutyLocation: async (obj, { _id }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.HR_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Duty Locations Setup Data in the System.'
        );
      }

      const usedCount = KarkunDuties.find({
        locationId: { $eq: _id },
      }).count();

      if (usedCount > 0) {
        throw new Error(
          'This location cannot be deleted as it is currently in use.'
        );
      }

      return DutyLocations.remove(_id);
    },
  },
};
