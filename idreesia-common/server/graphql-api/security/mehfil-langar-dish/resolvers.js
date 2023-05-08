import {
  MehfilLangarDishes,
  MehfilLangarDetails,
} from 'meteor/idreesia-common/server/collections/security';

export default {
  MehfilLangarDishType: {
    overallUsedCount: async mehfilLangarDishType =>
      MehfilLangarDetails.find({
        langarDishId: { $eq: mehfilLangarDishType._id },
      }).count(),
  },

  Query: {
    allSecurityMehfilLangarDishes: async () =>
      MehfilLangarDishes.find({}).fetch(),
    securityMehfilLangarDishById: async (obj, { id }) =>
      MehfilLangarDishes.findOne(id),
  },

  Mutation: {
    createSecurityMehfilLangarDish: async (
      obj,
      { name, urduName },
      { user }
    ) => {
      const date = new Date();
      const mehfilLangarDishId = MehfilLangarDishes.insert({
        name,
        urduName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return MehfilLangarDishes.findOne(mehfilLangarDishId);
    },

    updateSecurityMehfilLangarDish: async (
      obj,
      { id, name, urduName },
      { user }
    ) => {
      const date = new Date();
      MehfilLangarDishes.update(id, {
        $set: {
          name,
          urduName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return MehfilLangarDishes.findOne(id);
    },

    removeSecurityMehfilLangarDish: async (obj, { _id }) => {
      const usedCount = MehfilLangarDetails.find({
        langarDishId: { $eq: _id },
      }).count();

      if (usedCount > 0) {
        throw new Error(
          'This mehfil langar dish cannot be deleted as it is currently in use.'
        );
      }

      return MehfilLangarDishes.remove(_id);
    },
  },
};
