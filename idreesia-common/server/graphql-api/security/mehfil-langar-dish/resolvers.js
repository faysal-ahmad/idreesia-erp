import {
  MehfilLangarDishes,
  MehfilLangarDetails,
} from 'meteor/idreesia-common/server/collections/security';

export default {
  MehfilLangarDishType: {
    overallUsedCount: async mehfilLangarDishType =>
      MehfilLangarDetails.find({
        langarDishId: { $eq: mehfilLangarDishType._id },
      }).countAsync(),
  },

  Query: {
    allSecurityMehfilLangarDishes: async () =>
      MehfilLangarDishes.find({}).fetchAsync(),
    securityMehfilLangarDishById: async (obj, { id }) =>
      MehfilLangarDishes.findOneAsync(id),
  },

  Mutation: {
    createSecurityMehfilLangarDish: async (
      obj,
      { name, urduName },
      { user }
    ) => {
      const date = new Date();
      const mehfilLangarDishId = await MehfilLangarDishes.insertAsync({
        name,
        urduName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return MehfilLangarDishes.findOneAsync(mehfilLangarDishId);
    },

    updateSecurityMehfilLangarDish: async (
      obj,
      { id, name, urduName },
      { user }
    ) => {
      const date = new Date();
      await MehfilLangarDishes.updateAsync(id, {
        $set: {
          name,
          urduName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return MehfilLangarDishes.findOneAsync(id);
    },

    removeSecurityMehfilLangarDish: async (obj, { _id }) => {
      const usedCount = await MehfilLangarDetails.find({
        langarDishId: { $eq: _id },
      }).countAsync();

      if (usedCount > 0) {
        throw new Error(
          'This mehfil langar dish cannot be deleted as it is currently in use.'
        );
      }

      return MehfilLangarDishes.removeAsync(_id);
    },
  },
};
