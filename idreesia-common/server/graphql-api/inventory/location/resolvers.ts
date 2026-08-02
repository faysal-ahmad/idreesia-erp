import type DataLoader from 'dataloader';
import {
  PurchaseForms,
  IssuanceForms,
  Locations,
} from 'meteor/idreesia-common/server/collections/inventory';

interface LocationType {
  _id: string;
  physicalStoreId: string;
  parentId?: string;
}

interface LocationArgs extends LocationType {
  name?: string;
  description?: string;
}

interface ResolverContext {
  user: {
    _id: string;
  };
  loaders: {
    inventory: {
      locations: DataLoader<string, unknown>;
    };
  };
}

async function isLocationInUse(locationId: string, physicalStoreId: string) {
  // If this has any child locations then it is in use
  const childCount = await Locations.find({
    parentId: locationId,
    physicalStoreId,
  }).countAsync();
  if (childCount > 0) return true;
  // Check if it is being used in any purchase/issuance forms
  const purchaseFormCount = await PurchaseForms.find({
    locationId,
    physicalStoreId,
  }).countAsync();
  if (purchaseFormCount > 0) return true;
  const issuanceFormCount = await IssuanceForms.find({
    locationId,
    physicalStoreId,
  }).countAsync();
  if (issuanceFormCount > 0) return true;

  return false;
}

export default {
  Location: {
    refParent: async (
      location: LocationType,
      _args: unknown,
      {
        loaders: {
          inventory: { locations },
        },
      }: ResolverContext
    ) => {
      if (location.parentId) {
        return locations.load(location.parentId);
      }
      return null;
    },
    isInUse: async (location: LocationType) =>
      isLocationInUse(location._id, location.physicalStoreId),
  },
  Query: {
    locationById: async (_obj: unknown, { _id }: Pick<LocationArgs, '_id'>) => {
      return Locations.findOneAsync(_id);
    },

    locationsByPhysicalStoreId: async (
      _obj: unknown,
      { physicalStoreId }: Pick<LocationArgs, 'physicalStoreId'>
    ) => {
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
      _obj: unknown,
      { name, physicalStoreId, parentId, description }: LocationArgs,
      { user }: ResolverContext
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
      _obj: unknown,
      { _id, physicalStoreId, name, parentId, description }: LocationArgs,
      { user }: ResolverContext
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

    removeLocation: async (
      _obj: unknown,
      { _id, physicalStoreId }: LocationArgs
    ) => {
      const inUse = await isLocationInUse(_id, physicalStoreId);
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
