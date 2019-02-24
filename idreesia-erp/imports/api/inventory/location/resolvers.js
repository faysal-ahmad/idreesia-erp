import { Locations } from "meteor/idreesia-common/collections/inventory";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  Location: {
    refParent: location => {
      if (location.parentId) {
        return Locations.findOne(location.parentId);
      }
      return null;
    },
  },
  Query: {
    allLocations() {
      return Locations.find({}).fetch();
    },

    locationById(obj, { _id }) {
      return Locations.findOne(_id);
    },
  },

  Mutation: {
    createLocation(obj, { name, parentId, description }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      const date = new Date();
      const locationId = Locations.insert({
        name,
        parentId,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Locations.findOne(locationId);
    },

    updateLocation(obj, { _id, name, parentId, description }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      const date = new Date();
      Locations.update(_id, {
        $set: {
          name,
          parentId,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Locations.findOne(_id);
    },
  },
};
