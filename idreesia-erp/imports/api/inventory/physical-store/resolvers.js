import { PhysicalStores } from 'meteor/idreesia-common/collections/inventory';
import { filterByInstanceAccess, hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    allPhysicalStores(obj, params, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_VIEW_PHYSICAL_STORES])) {
        throw new Error('You do not have permission to view Physical Stores in the System.');
      }

      return PhysicalStores.find({}).fetch();
    },

    allAccessiblePhysicalStores(obj, params, { userId }) {
      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(userId, physicalStores);
      return filteredPhysicalStores;
    },

    physicalStoreById(obj, { id }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_VIEW_PHYSICAL_STORES])) {
        throw new Error('You do not have permission to view Physical Stores in the System.');
      }

      return PhysicalStores.findOne(id);
    },
  },

  Mutation: {
    createPhysicalStore(obj, { name, address }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_PHYSICAL_STORES])) {
        throw new Error('You do not have permission to manage Physical Stores in the System.');
      }

      const date = new Date();
      const physicalStoreId = PhysicalStores.insert({
        name,
        address,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return PhysicalStores.findOne(physicalStoreId);
    },

    updatePhysicalStore(obj, { id, name, address }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_PHYSICAL_STORES])) {
        throw new Error('You do not have permission to manage Physical Stores in the System.');
      }

      const date = new Date();
      PhysicalStores.update(id, {
        $set: {
          name,
          address,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return PhysicalStores.findOne(id);
    },
  },
};
