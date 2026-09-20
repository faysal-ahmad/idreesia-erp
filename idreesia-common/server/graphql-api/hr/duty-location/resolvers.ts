import {
  DutyLocations,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  DutyLocationType: {
    usedCount: async dutyLocationType =>
      KarkunDuties.find({
        locationId: { $eq: dutyLocationType._id },
      }).countAsync(),
  },

  Query: {
    allDutyLocations: async () => DutyLocations.find({}).fetchAsync(),
    dutyLocationById: async (obj, { id }) => DutyLocations.findOneAsync(id),
  },

  Mutation: {
    createDutyLocation: async (obj, { name }, { user }) => {
      const date = new Date();
      const dutyLocationId = await DutyLocations.insertAsync({
        name,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return DutyLocations.findOneAsync(dutyLocationId);
    },

    updateDutyLocation: async (obj, { id, name }, { user }) => {
      const date = new Date();
      await DutyLocations.updateAsync(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return DutyLocations.findOneAsync(id);
    },

    removeDutyLocation: async (obj, { _id }) => {
      const usedCount = await KarkunDuties.find({
        locationId: { $eq: _id },
      }).countAsync();

      if (usedCount > 0) {
        throw new Error(
          'This location cannot be deleted as it is currently in use.'
        );
      }

      return DutyLocations.removeAsync(_id);
    },
  },
};

export default resolvers;
