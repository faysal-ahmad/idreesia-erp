import {
  MehfilLangarLocations,
  MehfilLangarDetails,
} from 'meteor/idreesia-common/server/collections/security';

export default {
  MehfilLangarLocationType: {
    overallUsedCount: async mehfilLangarLocationType =>
      MehfilLangarDetails.find({
        langarLocationId: { $eq: mehfilLangarLocationType._id },
      }).countAsync(),
  },

  Query: {
    allSecurityMehfilLangarLocations: async () =>
      MehfilLangarLocations.find({}).fetchAsync(),
    securityMehfilLangarLocationById: async (obj, { id }) =>
      MehfilLangarLocations.findOneAsync(id),
  },

  Mutation: {
    createSecurityMehfilLangarLocation: async (
      obj,
      { name, urduName },
      { user }
    ) => {
      const date = new Date();
      const mehfilLangarLocationId = await MehfilLangarLocations.insertAsync({
        name,
        urduName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return MehfilLangarLocations.findOneAsync(mehfilLangarLocationId);
    },

    updateSecurityMehfilLangarLocation: async (
      obj,
      { id, name, urduName },
      { user }
    ) => {
      const date = new Date();
      await MehfilLangarLocations.updateAsync(id, {
        $set: {
          name,
          urduName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return MehfilLangarLocations.findOneAsync(id);
    },

    removeSecurityMehfilLangarLocation: async (obj, { _id }) => {
      const usedCount = await MehfilLangarDetails.find({
        langarLocationId: { $eq: _id },
      }).countAsync();

      if (usedCount > 0) {
        throw new Error(
          'This mehfil langar location cannot be deleted as it is currently in use.'
        );
      }

      return MehfilLangarLocations.removeAsync(_id);
    },
  },
};
