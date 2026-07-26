import {
  Vendors,
  PurchaseForms,
} from 'meteor/idreesia-common/server/collections/inventory';

interface Vendor {
  _id: string;
  physicalStoreId: string;
  name?: string;
  contactPerson?: string;
  contactNumber?: string;
  address?: string;
  notes?: string;
}

interface ResolverContext {
  user: {
    _id: string;
  };
}

export default {
  Vendor: {
    usageCount: async (vendor: Vendor) =>
      PurchaseForms.find({
        vendorId: { $eq: vendor._id },
      }).countAsync(),
  },
  Query: {
    vendorById: async (_obj: unknown, { _id }: Pick<Vendor, '_id'>) => {
      return Vendors.findOneAsync(_id);
    },

    vendorsByPhysicalStoreId: async (
      _obj: unknown,
      { physicalStoreId }: Pick<Vendor, 'physicalStoreId'>
    ) => {
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
      _obj: unknown,
      { name, physicalStoreId, contactPerson, contactNumber, address, notes }: Vendor,
      { user }: ResolverContext
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
      _obj: unknown,
      {
        _id,
        physicalStoreId,
        name,
        contactPerson,
        contactNumber,
        address,
        notes,
      }: Vendor,
      { user }: ResolverContext
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

    removeVendor: async (
      _obj: unknown,
      { _id, physicalStoreId }: Pick<Vendor, '_id' | 'physicalStoreId'>
    ) => {
      const purchaseFormsCount = await PurchaseForms.find({
        vendorId: { $eq: _id },
        physicalStoreId: { $eq: physicalStoreId },
      }).countAsync();

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
