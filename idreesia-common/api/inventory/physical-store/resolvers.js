import { PhysicalStores } from "meteor/idreesia-common/collections/inventory";
import {
  filterByInstanceAccess,
  hasOnePermission
} from "meteor/idreesia-common/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  Query: {
    allPhysicalStores(obj, params, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_PHYSICAL_STORES
        ])
      ) {
        throw new Error(
          "You do not have permission to view Physical Stores in the System."
        );
      }

      return PhysicalStores.find({}).fetch();
    },

    allAccessiblePhysicalStores(obj, params, { user }) {
      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(
        user._id,
        physicalStores
      );
      return filteredPhysicalStores;
    },

    physicalStoreById(obj, { id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_VIEW_PHYSICAL_STORES
        ])
      ) {
        throw new Error(
          "You do not have permission to view Physical Stores in the System."
        );
      }

      return PhysicalStores.findOne(id);
    }
  },

  Mutation: {
    createPhysicalStore(obj, { name, address }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_PHYSICAL_STORES
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Physical Stores in the System."
        );
      }

      const date = new Date();
      const physicalStoreId = PhysicalStores.insert({
        name,
        address,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id
      });

      return PhysicalStores.findOne(physicalStoreId);
    },

    updatePhysicalStore(obj, { id, name, address }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ADMIN_MANAGE_PHYSICAL_STORES
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Physical Stores in the System."
        );
      }

      const date = new Date();
      PhysicalStores.update(id, {
        $set: {
          name,
          address,
          updatedAt: date,
          updatedBy: user._id
        }
      });

      return PhysicalStores.findOne(id);
    }
  }
};
