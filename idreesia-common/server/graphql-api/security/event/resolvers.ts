import {
  SecurityEvents,
  SecurityEventKarkuns,
} from 'meteor/idreesia-common/server/collections/security';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const toEventDate = (eventDate: string | number | Date) => {
  if (eventDate instanceof Date) return eventDate;
  const asNumber = Number(eventDate);
  if (Number.isFinite(asNumber) && String(eventDate).trim() !== '') {
    return new Date(asNumber);
  }
  return new Date(eventDate);
};

const resolvers: ResolverMap = {
  SecurityEventType: {
    karkunCount: async eventType =>
      SecurityEventKarkuns.find({
        eventId: { $eq: eventType._id },
      }).countAsync(),
    eventKarkuns: async eventType =>
      SecurityEventKarkuns.find({
        eventId: { $eq: eventType._id },
      }).fetchAsync(),
    eventDate: eventType => {
      if (!eventType.eventDate) return null;
      const value =
        eventType.eventDate instanceof Date
          ? eventType.eventDate.getTime()
          : Number(eventType.eventDate);
      return Number.isFinite(value) ? String(value) : String(eventType.eventDate);
    },
  },

  Query: {
    allSecurityEvents: async () =>
      SecurityEvents.find({}, { sort: { eventDate: -1 } }).fetchAsync(),

    securityEventById: async (obj, { _id }) => SecurityEvents.findOneAsync(_id),
  },

  Mutation: {
    createSecurityEvent: async (obj, { name, eventDate }, { user }) => {
      const date = new Date();
      const eventId = await SecurityEvents.insertAsync({
        name,
        eventDate: toEventDate(eventDate),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SecurityEvents.findOneAsync(eventId);
    },

    updateSecurityEvent: async (obj, { _id, name, eventDate }, { user }) => {
      const date = new Date();
      await SecurityEvents.updateAsync(_id, {
        $set: {
          name,
          ...(eventDate != null
            ? { eventDate: toEventDate(eventDate) }
            : {}),
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return SecurityEvents.findOneAsync(_id);
    },

    removeSecurityEvent: async (obj, { _id }) => {
      const karkunCount = await SecurityEventKarkuns.find({
        eventId: { $eq: _id },
      }).countAsync();

      if (karkunCount > 0) {
        throw new Error(
          'This event cannot be deleted since it has karkuns associated with it.'
        );
      }

      return SecurityEvents.removeAsync(_id);
    },
  },
};

export default resolvers;
