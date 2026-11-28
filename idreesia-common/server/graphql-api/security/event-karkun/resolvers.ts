import { Random } from 'meteor/random';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  SecurityEvents,
  SecurityEventKarkuns,
  SecurityEventDuties,
} from 'meteor/idreesia-common/server/collections/security';
import { searchSecurityEventPeople } from 'meteor/idreesia-common/server/business-logic/security/event-people';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SecurityEventKarkunType: {
    event: async eventKarkunType =>
      SecurityEvents.findOneAsync(eventKarkunType.eventId),
    duty: async eventKarkunType =>
      SecurityEventDuties.findOneAsync(eventKarkunType.dutyId),
    karkun: async eventKarkunType =>
      People.findOneAsync(eventKarkunType.karkunId),
  },

  Query: {
    securityEventKarkunsByEventId: async (obj, { eventId, dutyId }) => {
      if (dutyId) {
        return SecurityEventKarkuns.find(
          { eventId, dutyId },
          { $sort: { dutyId: 1 } }
        ).fetchAsync();
      }

      return SecurityEventKarkuns.find({ eventId }).fetchAsync();
    },

    securityEventKarkunsByIds: async (obj, { ids }) => {
      const idsArray = ids.split(',');
      return SecurityEventKarkuns.find({
        _id: { $in: idsArray },
      }).fetchAsync();
    },

    securityEventKarkunByBarcodeId: async (obj, { barcode }) =>
      SecurityEventKarkuns.findOneAsync({
        dutyCardBarcodeId: barcode,
      }),

    pagedSecurityEventPeople: async (obj, args) =>
      searchSecurityEventPeople(args),
  },

  Mutation: {
    addSecurityEventKarkun: async (obj, { eventId, karkunId, dutyId }, { user }) => {
      const existingEventKarkun = await SecurityEventKarkuns.findOneAsync({
        eventId,
        karkunId,
        dutyId,
      });

      if (existingEventKarkun) return existingEventKarkun;

      const date = new Date();
      const eventKarkunId = await SecurityEventKarkuns.insertAsync({
        eventId,
        karkunId,
        dutyId,
        dutyCardBarcodeId: Random.id(8),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return SecurityEventKarkuns.findOneAsync(eventKarkunId);
    },

    setDutyDetail: async (obj, { ids, dutyDetail }, { user }) => {
      const date = new Date();
      await SecurityEventKarkuns.updateAsync(
        {
          _id: { $in: ids },
        },
        {
          $set: {
            dutyDetail,
            updatedAt: date,
            updatedBy: user._id,
          },
        },
        { multi: true }
      );

      return SecurityEventKarkuns.find({ _id: { $in: ids } }).fetchAsync();
    },

    removeSecurityEventKarkun: async (obj, { _id }) => SecurityEventKarkuns.removeAsync(_id),
  },
};

export default resolvers;
