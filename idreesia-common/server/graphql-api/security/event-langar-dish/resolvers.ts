import {
  SecurityEventLangarDishes,
  SecurityEventLangarDetails,
} from 'meteor/idreesia-common/server/collections/security';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SecurityEventLangarDishType: {
    overallUsedCount: async eventLangarDishType =>
      SecurityEventLangarDetails.find({
        langarDishId: { $eq: eventLangarDishType._id },
      }).countAsync(),
  },

  Query: {
    allSecurityEventLangarDishes: async () =>
      SecurityEventLangarDishes.find({}).fetchAsync(),
    securityEventLangarDishById: async (obj, { id }) =>
      SecurityEventLangarDishes.findOneAsync(id),
  },

  Mutation: {
    createSecurityEventLangarDish: async (
      obj,
      { name, urduName },
      { user }
    ) => {
      const date = new Date();
      const eventLangarDishId = await SecurityEventLangarDishes.insertAsync({
        name,
        urduName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SecurityEventLangarDishes.findOneAsync(eventLangarDishId);
    },

    updateSecurityEventLangarDish: async (
      obj,
      { id, name, urduName },
      { user }
    ) => {
      const date = new Date();
      await SecurityEventLangarDishes.updateAsync(id, {
        $set: {
          name,
          urduName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SecurityEventLangarDishes.findOneAsync(id);
    },

    removeSecurityEventLangarDish: async (obj, { _id }) => {
      const usedCount = await SecurityEventLangarDetails.find({
        langarDishId: { $eq: _id },
      }).countAsync();

      if (usedCount > 0) {
        throw new Error(
          'This event langar dish cannot be deleted as it is currently in use.'
        );
      }

      return SecurityEventLangarDishes.removeAsync(_id);
    },
  },
};

export default resolvers;
