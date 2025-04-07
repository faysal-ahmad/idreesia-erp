import {
  Vendors,
  PurchaseForms,
} from 'meteor/idreesia-common/server/collections/inventory';

export default {
  Vendor: {
    usageCount: async vendor =>
      PurchaseForms.find({
        vendorId: { $eq: vendor._id },
      }).count(),
  },
  Query: {
    vendorById: async (obj, { _id }) => {
      return Vendors.findOneAsync(_id);
    },

    vendorsByPhysicalStoreId: async (obj, { physicalStoreId }) => {
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
      {
        _id,
        physicalStoreId,
        name,
        contactPerson,
        contactNumber,
        address,
        notes,
      },
      { user }
    ) => {
      const date = new Date();
      await Vendors.updateAsync(
        {
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        },
        {
          $set: {
            name,
            contactPerson,
            contactNumber,
            address,
            notes,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return Vendors.findOneAsync(_id);
    },

    removeVendor: async (obj, { _id, physicalStoreId }) => {
      const purchaseFormsCount = PurchaseForms.find({
        vendorId: { $eq: _id },
        physicalStoreId: { $eq: physicalStoreId },
      }).count();

      if (purchaseFormsCount === 0) {
        return Vendors.removeAsync({
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        });
      }

      return 0;
    },
  },
};
