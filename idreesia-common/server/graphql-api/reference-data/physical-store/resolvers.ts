import { PhysicalStores } from 'meteor/idreesia-common/server/collections/inventory';

export default {
  Query: {
    referencePhysicalStores: async () => PhysicalStores.find({}).fetchAsync(),

    referencePhysicalStoreById: async (
      _obj: unknown,
      { id }: { id: string }
    ) => PhysicalStores.findOneAsync(id),
  },
};
