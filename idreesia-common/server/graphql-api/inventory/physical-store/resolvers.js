import { PhysicalStores } from 'meteor/idreesia-common/server/collections/inventory';
import { filterByInstanceAccess } from 'meteor/idreesia-common/server/graphql-api/security';

export default {
  Query: {
    allPhysicalStores: async () => {
      return PhysicalStores.find({}).fetchAsync();
    },

    allAccessiblePhysicalStores: async (obj, params, { user }) => {
      const physicalStores = await PhysicalStores.find({}).fetchAsync();
      const filteredPhysicalStores = filterByInstanceAccess(
        user,
        physicalStores
      );
      return filteredPhysicalStores;
    },

    physicalStoreById: async (obj, { id }) => {
      return PhysicalStores.findOneAsync(id);
    },
  },

  Mutation: {
    createPhysicalStore: async (obj, { name, address }, { user }) => {
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

    updatePhysicalStore: async (obj, { id, name, address }, { user }) => {
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
