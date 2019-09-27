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
    usageCount: vendor =>
      PurchaseForms.find({
        vendorId: { $eq: vendor._id },
      }).count(),
  },
  Query: {
    vendorById(obj, { _id }, { user }) {
      const vendor = Vendors.findOne(_id);
      if (hasInstanceAccess(user._id, vendor.physicalStoreId) === false) {
        return null;
      }
      return vendor;
    },

    vendorsByPhysicalStoreId(obj, { physicalStoreId }, { user }) {
      if (hasInstanceAccess(user._id, physicalStoreId) === false) return [];
      return Vendors.find(
        {
          physicalStoreId: { $eq: physicalStoreId },
        },
        { sort: { name: 1 } }
      ).fetch();
    },
  },

  Mutation: {
    createVendor(
      obj,
      { name, physicalStoreId, contactPerson, contactNumber, address, notes },
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
      const vendorId = Vendors.insert({
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

      return Vendors.findOne(vendorId);
    },

    updateVendor(
      obj,
      { _id, name, contactPerson, contactNumber, address, notes },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      const existingVendor = Vendors.findOne(_id);
      if (
        !existingVendor ||
        hasInstanceAccess(user._id, existingVendor.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      const date = new Date();
      Vendors.update(_id, {
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

      return Vendors.findOne(_id);
    },

    removeVendor(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      const existingVendor = Vendors.findOne(_id);
      if (
        !existingVendor ||
        hasInstanceAccess(user._id, existingVendor.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      return Vendors.remove(_id);
    },
  },
};
