import {
  Vendors,
  PrintingOrders,
} from 'meteor/idreesia-common/server/collections/wazaif';

export default {
  WazaifVendor: {
    usageCount: vendor =>
      PrintingOrders.find({
        vendorId: { $eq: vendor._id },
      }).count(),
  },
  Query: {
    wazaifVendorById(obj, { _id }) {
      return Vendors.findOne(_id);
    },

    allWazaifVendors() {
      return Vendors.find({}, { sort: { name: 1 } }).fetch();
    },
  },

  Mutation: {
    createWazaifVendor(
      obj,
      { name, contactPerson, contactNumber, address, notes },
      { user }
    ) {
      const date = new Date();
      const vendorId = Vendors.insert({
        name,
        contactPerson,
        contactNumber,
        address,
        notes,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Vendors.findOne(vendorId);
    },

    updateWazaifVendor(
      obj,
      { _id, name, contactPerson, contactNumber, address, notes },
      { user }
    ) {
      const date = new Date();
      Vendors.update(_id, {
        $set: {
          name,
          contactPerson,
          contactNumber,
          address,
          notes,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Vendors.findOne(_id);
    },

    removeWazaifVendor(obj, { _id }) {
      return Vendors.remove(_id);
    },
  },
};
