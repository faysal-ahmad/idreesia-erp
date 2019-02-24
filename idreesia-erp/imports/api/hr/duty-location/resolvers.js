import {
  DutyLocations,
  KarkunDuties,
} from "meteor/idreesia-common/collections/hr";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  DutyLocationType: {
    usedCount: dutyLocationType =>
      KarkunDuties.find({
        locationId: { $eq: dutyLocationType._id },
      }).count(),
  },

  Query: {
    allDutyLocations() {
      return DutyLocations.find({}).fetch();
    },
    dutyLocationById(obj, { id }) {
      return DutyLocations.findOne(id);
    },
  },

  Mutation: {
    createDutyLocation(obj, { name }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Locations Setup Data in the System."
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

    updateDutyLocation(obj, { id, name }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Locations Setup Data in the System."
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

    removeDutyLocation(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Duty Locations Setup Data in the System."
        );
      }

      return DutyLocations.remove(_id);
    },
  },
};
