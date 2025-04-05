import {
  PurchaseForms,
  IssuanceForms,
  Locations,
} from 'meteor/idreesia-common/server/collections/inventory';

function isLocationInUse(locationId, physicalStoreId) {
  // If this has any child locations then it is in use
  const childCount = Locations.find({
    parentId: locationId,
    physicalStoreId,
  }).count();
  if (childCount > 0) return true;
  // Check if it is being used in any purchase/issuance forms
  const purchaseFormCount = PurchaseForms.find({
    locationId,
    physicalStoreId,
  }).count();
  if (purchaseFormCount > 0) return true;
  const issuanceFormCount = IssuanceForms.find({
    locationId,
    physicalStoreId,
  }).count();
  if (issuanceFormCount > 0) return true;

  return false;
}

export default {
  Location: {
    refParent: async (
      location,
      args,
      {
        loaders: {
          inventory: { locations },
        },
      }
    ) => {
      if (location.parentId) {
        return locations.load(location.parentId);
      }
      return null;
    },
    isInUse: async location =>
      isLocationInUse(location._id, location.physicalStoreId),
  },
  Query: {
    locationById: async (obj, { _id }, { user }) => {
      return Locations.findOneAsync(_id);
    },

    locationsByPhysicalStoreId: async (obj, { physicalStoreId }, { user }) => {
      return Locations.find(
        {
          physicalStoreId: { $eq: physicalStoreId },
        },
        { sort: { name: 1 } }
      ).fetchAsync();
    },
  },

  Mutation: {
    createLocation: async (
      obj,
      { name, physicalStoreId, parentId, description },
      { user }
    ) => {
      const date = new Date();
      const locationId = await Locations.insertAsync({
        name,
        physicalStoreId,
        parentId,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Locations.findOneAsync(locationId);
    },

    updateLocation: async (
      obj,
      { _id, physicalStoreId, name, parentId, description },
      { user }
    ) => {
      const date = new Date();
      await Locations.updateAsync(
        {
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        },
        {
          $set: {
            name,
            parentId,
            description,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return Locations.findOneAsync(_id);
    },

    removeLocation: async (obj, { _id, physicalStoreId }, { user }) => {
      const inUse = isLocationInUse(_id, physicalStoreId);
      if (!inUse) {
        return Locations.removeAsync({
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        });
      }

      return 0;
    },
  },
};
