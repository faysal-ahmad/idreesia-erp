import {
  Vendors,
  PurchaseForms,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  hasOnePermission,
  hasInstanceAccess,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Vendor: {
    usageCount: async vendor =>
      PurchaseForms.find({
        vendorId: { $eq: vendor._id },
      }).count(),
  },
  Query: {
    vendorById: async (obj, { _id }, { user }) => {
      const vendor = await Vendors.findOneAsync(_id);
      if (hasInstanceAccess(user, vendor.physicalStoreId) === false) {
        return null;
      }
      return vendor;
    },

    vendorsByPhysicalStoreId: async (obj, { physicalStoreId }, { user }) => {
      if (hasInstanceAccess(user, physicalStoreId) === false) return [];
      return Vendors.find(
        {
          physicalStoreId: { $eq: physicalStoreId },
        },
        { sort: { name: 1 } }
      ).fetchAsync();
    },
  },

  Mutation: {
    createVendor: async (
      obj,
      { name, physicalStoreId, contactPerson, contactNumber, address, notes },
      { user }
    ) => {
      if (!hasOnePermission(user, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      const date = new Date();
      const vendorId = await Vendors.insertAsync({
        name,
        physicalStoreId,
        contactPerson,
        contactNumber,
        address,
        notes,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Vendors.findOneAsync(vendorId);
    },

    updateVendor: async (
      obj,
      { _id, name, contactPerson, contactNumber, address, notes },
      { user }
    ) => {
      if (!hasOnePermission(user, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      const existingVendor = await Vendors.findOneAsync(_id);
      if (
        !existingVendor ||
        hasInstanceAccess(user, existingVendor.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      const date = new Date();
      await Vendors.updateAsync(_id, {
        $set: {
          name,
          contactPerson,
          contactNumber,
          address,
          notes,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Vendors.findOneAsync(_id);
    },

    removeVendor: async (obj, { _id }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      const existingVendor = await Vendors.findOneAsync(_id);
      if (
        !existingVendor ||
        hasInstanceAccess(user, existingVendor.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      return Vendors.removeAsync(_id);
    },
  },
};
