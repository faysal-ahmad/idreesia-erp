import {
  SecurityEventLangarLocations,
  SecurityEventLangarDetails,
} from 'meteor/idreesia-common/server/collections/security';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SecurityEventLangarLocationType: {
    overallUsedCount: async eventLangarLocationType =>
      SecurityEventLangarDetails.find({
        langarLocationId: { $eq: eventLangarLocationType._id },
      }).countAsync(),
  },

  Query: {
    allSecurityEventLangarLocations: async () =>
      SecurityEventLangarLocations.find({}).fetchAsync(),
    securityEventLangarLocationById: async (obj, { id }) =>
      SecurityEventLangarLocations.findOneAsync(id),
  },

  Mutation: {
    createSecurityEventLangarLocation: async (
      obj,
      { name, urduName },
      { user }
    ) => {
      const date = new Date();
      const eventLangarLocationId = await SecurityEventLangarLocations.insertAsync({
        name,
        urduName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SecurityEventLangarLocations.findOneAsync(eventLangarLocationId);
    },

    updateSecurityEventLangarLocation: async (
      obj,
      { id, name, urduName },
      { user }
    ) => {
      const date = new Date();
      await SecurityEventLangarLocations.updateAsync(id, {
        $set: {
          name,
          urduName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SecurityEventLangarLocations.findOneAsync(id);
    },

    removeSecurityEventLangarLocation: async (obj, { _id }) => {
      const usedCount = await SecurityEventLangarDetails.find({
        langarLocationId: { $eq: _id },
      }).countAsync();

      if (usedCount > 0) {
        throw new Error(
          'This event langar location cannot be deleted as it is currently in use.'
        );
      }

      return SecurityEventLangarLocations.removeAsync(_id);
    },
  },
};

export default resolvers;
