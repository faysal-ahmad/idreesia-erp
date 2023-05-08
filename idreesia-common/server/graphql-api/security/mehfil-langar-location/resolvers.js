import {
  MehfilLangarLocations,
  MehfilLangarDetails,
} from 'meteor/idreesia-common/server/collections/security';

export default {
  MehfilLangarLocationType: {
    overallUsedCount: async mehfilLangarLocationType =>
      MehfilLangarDetails.find({
        langarLocationId: { $eq: mehfilLangarLocationType._id },
      }).count(),
  },

  Query: {
    allSecurityMehfilLangarLocations: async () =>
      MehfilLangarLocations.find({}).fetch(),
    securityMehfilLangarLocationById: async (obj, { id }) =>
      MehfilLangarLocations.findOne(id),
  },

  Mutation: {
    createSecurityMehfilLangarLocation: async (
      obj,
      { name, urduName },
      { user }
    ) => {
      const date = new Date();
      const mehfilLangarLocationId = MehfilLangarLocations.insert({
        name,
        urduName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return MehfilLangarLocations.findOne(mehfilLangarLocationId);
    },

    updateSecurityMehfilLangarLocation: async (
      obj,
      { id, name, urduName },
      { user }
    ) => {
      const date = new Date();
      MehfilLangarLocations.update(id, {
        $set: {
          name,
          urduName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return MehfilLangarLocations.findOne(id);
    },

    removeSecurityMehfilLangarLocation: async (obj, { _id }) => {
      const usedCount = MehfilLangarDetails.find({
        langarLocationId: { $eq: _id },
      }).count();

      if (usedCount > 0) {
        throw new Error(
          'This mehfil langar location cannot be deleted as it is currently in use.'
        );
      }

      return MehfilLangarLocations.remove(_id);
    },
  },
};
