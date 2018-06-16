import { PhysicalStores } from '/imports/lib/collections/inventory';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

export default {
  Query: {
    allPhysicalStores() {
      return PhysicalStores.find({}).fetch();
    },
    physicalStoreById(obj, { id }) {
      return PhysicalStores.findOne(id);
    },
  },

  Mutation: {
    createPhysicalStore(obj, { name, address }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Inventory Setup Data in the System.');
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
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Inventory Setup Data in the System.');
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
