import { UserGroups } from 'meteor/idreesia-common/server/collections/admin';
import { PhysicalStores } from 'meteor/idreesia-common/server/collections/inventory';
import { DataSource } from 'meteor/idreesia-common/constants';
import {
  addPhysicalStoreAccessGroup,
  addPhysicalStoreAccessUser,
  filterAccessibleStores,
  listPhysicalStoreAccess,
  removePhysicalStoreAccessGroup,
  removePhysicalStoreAccessUser,
  searchStoreAccessKarkuns,
} from 'meteor/idreesia-common/server/business-logic/inventory/store-access';

interface PhysicalStore {
  _id: string;
  id: string;
  name?: string;
  address?: string;
}

interface ResolverContext {
  user: {
    _id: string;
    username?: string;
    locked?: boolean;
    isSuperAdmin?: boolean;
    groups?: string[];
  };
}

export default {
  Query: {
    allAccessiblePhysicalStores: async (
      _obj: unknown,
      _params: unknown,
      { user }: ResolverContext
    ) => {
      const physicalStores = await PhysicalStores.find({}).fetchAsync();
      const accessible = await filterAccessibleStores(user, physicalStores);
      return accessible.map(({ store, permissions }) => ({
        ...store,
        permissions,
      }));
    },

    physicalStoreAccess: async (
      _obj: unknown,
      { physicalStoreId }: { physicalStoreId: string }
    ) => listPhysicalStoreAccess(physicalStoreId),

    storeAccessKarkunSearch: async (
      _obj: unknown,
      args: {
        name?: string;
        cnicNumber?: string;
        phoneNumber?: string;
        pageIndex?: string;
        pageSize?: string;
      }
    ) => searchStoreAccessKarkuns(args),

    storeAccessUserGroups: async () =>
      UserGroups.find({}, { sort: { name: 1 } }).fetchAsync(),

    physicalStoreById: async (
      _obj: unknown,
      { id }: Pick<PhysicalStore, 'id'>
    ) => {
      return PhysicalStores.findOneAsync(id);
    },
  },

  Mutation: {
    createPhysicalStore: async (
      _obj: unknown,
      { name, address }: PhysicalStore,
      { user }: ResolverContext
    ) => {
      const date = new Date();
      const physicalStoreId = await PhysicalStores.insertAsync({
        name,
        address,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return PhysicalStores.findOneAsync(physicalStoreId);
    },

    updatePhysicalStore: async (
      _obj: unknown,
      { id, name, address }: PhysicalStore,
      { user }: ResolverContext
    ) => {
      const date = new Date();
      await PhysicalStores.updateAsync(id, {
        $set: {
          name,
          address,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return PhysicalStores.findOneAsync(id);
    },

    addPhysicalStoreAccessUser: async (
      _obj: unknown,
      values: { physicalStoreId: string; permission: string; karkunId: string },
      { user }: ResolverContext
    ) => addPhysicalStoreAccessUser(values, user, DataSource.ADMIN),

    removePhysicalStoreAccessUser: async (
      _obj: unknown,
      values: { physicalStoreId: string; permission: string; userId: string },
      { user }: ResolverContext
    ) => removePhysicalStoreAccessUser(values, user, DataSource.ADMIN),

    addPhysicalStoreAccessGroup: async (
      _obj: unknown,
      values: { physicalStoreId: string; permission: string; groupId: string },
      { user }: ResolverContext
    ) => addPhysicalStoreAccessGroup(values, user, DataSource.ADMIN),

    removePhysicalStoreAccessGroup: async (
      _obj: unknown,
      values: { physicalStoreId: string; permission: string; groupId: string },
      { user }: ResolverContext
    ) => removePhysicalStoreAccessGroup(values, user, DataSource.ADMIN),
  },
};
