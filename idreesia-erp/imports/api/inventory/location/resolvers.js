import { Locations } from "meteor/idreesia-common/collections/inventory";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  Query: {
    allLocations() {
      return Locations.find({}).fetch();
    },

    locationById(obj, { _id }) {
      return Locations.findOne(_id);
    },
  },

  Mutation: {
    createLocation(obj, { name, description }, { userId }) {
      if (
        !hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      const date = new Date();
      const locationId = Locations.insert({
        name,
        description,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return Locations.findOne(locationId);
    },

    updateLocation(obj, { _id, name, description }, { userId }) {
      if (
        !hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      const date = new Date();
      Locations.update(_id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return Locations.findOne(_id);
    },
  },
};
