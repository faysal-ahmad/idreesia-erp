import { PhysicalStores } from 'meteor/idreesia-common/server/collections/inventory';
import { filterByInstanceAccess } from 'meteor/idreesia-common/server/graphql-api/security';

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
    instances?: string[];
  };
}

export default {
  Query: {
    allPhysicalStores: async () => {
      return PhysicalStores.find({}).fetchAsync();
    },

    allAccessiblePhysicalStores: async (
      _obj: unknown,
      _params: unknown,
      { user }: ResolverContext
    ) => {
      const physicalStores = await PhysicalStores.find({}).fetchAsync();
      const filteredPhysicalStores = filterByInstanceAccess(
        user,
        physicalStores as Array<{ _id: string; [key: string]: unknown }>
      );
      return filteredPhysicalStores;
    },

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
  },
};
