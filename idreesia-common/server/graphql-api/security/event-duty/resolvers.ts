import {
  SecurityEventDuties,
  SecurityEventKarkuns,
} from 'meteor/idreesia-common/server/collections/security';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SecurityEventDutyType: {
    overallUsedCount: async eventDutyType =>
      SecurityEventKarkuns.find({
        dutyId: { $eq: eventDutyType._id },
      }).countAsync(),
    eventUsedCount: async (eventDutyType, args, context, info) => {
      const eventId = info?.variableValues?.eventId;
      if (eventId) {
        return SecurityEventKarkuns.find({
          eventId,
          dutyId: { $eq: eventDutyType._id },
        }).countAsync();
      }
      return 0;
    },
  },

  Query: {
    allSecurityEventDuties: async () => SecurityEventDuties.find({}).fetchAsync(),

    securityEventDutyById: async (obj, { id }) => SecurityEventDuties.findOneAsync(id),
  },

  Mutation: {
    createSecurityEventDuty: async (obj, { name, urduName }, { user }) => {
      const date = new Date();
      const eventDutyId = await SecurityEventDuties.insertAsync({
        name,
        urduName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SecurityEventDuties.findOneAsync(eventDutyId);
    },

    updateSecurityEventDuty: async (obj, { id, name, urduName }, { user }) => {
      const date = new Date();
      await SecurityEventDuties.updateAsync(id, {
        $set: {
          name,
          urduName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SecurityEventDuties.findOneAsync(id);
    },

    removeSecurityEventDuty: async (obj, { _id }) => {
      const usedCount = await SecurityEventKarkuns.find({
        dutyId: { $eq: _id },
      }).countAsync();

      if (usedCount > 0) {
        throw new Error(
          'This event duty cannot be deleted as it is currently in use.'
        );
      }

      return SecurityEventDuties.removeAsync(_id);
    },
  },
};

export default resolvers;
