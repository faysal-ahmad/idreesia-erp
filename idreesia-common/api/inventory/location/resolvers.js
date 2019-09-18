import {
  PurchaseForms,
  IssuanceForms,
  Locations,
} from 'meteor/idreesia-common/collections/inventory';
import {
  hasOnePermission,
  hasInstanceAccess,
} from 'meteor/idreesia-common/api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Location: {
    refParent: location => {
      if (location.parentId) {
        return Locations.findOne(location.parentId);
      }
      return null;
    },
    isInUse: location => {
      // If this has any child locations then it is in use
      const childCount = Locations.find({ parentId: location._id }).count();
      if (childCount > 0) return true;
      // Check if it is being used in any purchase/issuance forms
      const purchaseFormCount = PurchaseForms.find({
        locationId: location._id,
      }).count();
      if (purchaseFormCount > 0) return true;
      const issuanceFormCount = IssuanceForms.find({
        locationId: location._id,
      }).count();
      if (issuanceFormCount > 0) return true;

      return false;
    },
  },
  Query: {
    locationById(obj, { _id }, { user }) {
      const location = Locations.findOne(_id);
      if (hasInstanceAccess(user._id, location.physicalStoreId) === false) {
        return null;
      }
      return location;
    },

    locationsByPhysicalStoreId(obj, { physicalStoreId }, { user }) {
      if (hasInstanceAccess(user._id, physicalStoreId) === false) return [];
      return Locations.find(
        {
          physicalStoreId: { $eq: physicalStoreId },
        },
        { sort: { name: 1 } }
      ).fetch();
    },
  },

  Mutation: {
    createLocation(
      obj,
      { name, physicalStoreId, parentId, description },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      const date = new Date();
      const locationId = Locations.insert({
        name,
        physicalStoreId,
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
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      const existingLocation = Locations.findOne(_id);
      if (
        !existingLocation ||
        hasInstanceAccess(user._id, existingLocation.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
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

    removeLocation(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      const existingLocation = Locations.findOne(_id);
      if (
        !existingLocation ||
        hasInstanceAccess(user._id, existingLocation.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      return Locations.remove(_id);
    },
  },
};
