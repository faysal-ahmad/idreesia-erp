import { PhysicalStores } from '/imports/lib/collections/inventory';

export default {
  Query: {
    allPhysicalStores() {
      return PhysicalStores.find({}).fetch();
    },
    physicalStoreById(obj, { id }, context) {
      return PhysicalStores.findOne(id);
    }
  },

  Mutation: {
    createPhysicalStore(obj, { name, address }, { userId }) {
      const date = new Date();
      const physicalStoreId = PhysicalStores.insert({
        name,
        address,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId
      });

      return PhysicalStores.findOne(physicalStoreId);
    },

    updatePhysicalStore(obj, { id, name, address }, { userId }) {
      const date = new Date();
      PhysicalStores.update(id, {
        $set: {
          name,
          address,
          updatedAt: date,
          updatedBy: userId
        }
      });

      return PhysicalStores.findOne(id);
    }
  }
};
