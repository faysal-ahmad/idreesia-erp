import {
  KarkunDuties,
  Duties,
  DutyShifts,
  DutyLocations,
} from 'meteor/idreesia-common/server/collections/hr';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  KarkunDutyType: {
    duty: async karkunDutyType => Duties.findOneAsync(karkunDutyType.dutyId),
    shift: async karkunDutyType => {
      if (!karkunDutyType.shiftId) return null;
      return DutyShifts.findOneAsync(karkunDutyType.shiftId);
    },
    location: async karkunDutyType => {
      if (!karkunDutyType.locationId) return null;
      return DutyLocations.findOneAsync(karkunDutyType.locationId);
    },

    dutyName: async karkunDutyType => {
      const duty = await Duties.findOneAsync(karkunDutyType.dutyId);
      return duty ? duty.name : null;
    },
    shiftName: async karkunDutyType => {
      if (!karkunDutyType.shiftId) return null;
      const shift = await DutyShifts.findOneAsync(karkunDutyType.shiftId);
      return shift ? shift.name : null;
    },
    locationName: async karkunDutyType => {
      if (!karkunDutyType.locationId) return null;
      const location = await DutyLocations.findOneAsync(
        karkunDutyType.locationId
      );
      return location ? location.name : null;
    },
  },

  Query: {
    karkunDutiesByKarkunId: async (obj, { karkunId }) =>
      KarkunDuties.find({
        karkunId: { $eq: karkunId },
      }).fetchAsync(),
    karkunDutyById: async (obj, { _id }) => KarkunDuties.findOneAsync(_id),
  },

  Mutation: {
    createKarkunDuty: async (
      obj,
      { karkunId, dutyId, role, shiftId, locationId, daysOfWeek }
    ) => {
      const newDuty = {
        karkunId,
        dutyId,
        shiftId,
        locationId,
        role,
        daysOfWeek,
      };
      const karkunDutyId = await KarkunDuties.insertAsync(newDuty);
      return KarkunDuties.findOneAsync(karkunDutyId);
    },

    updateKarkunDuty: async (
      obj,
      { _id, karkunId, dutyId, shiftId, locationId, role, daysOfWeek }
    ) => {
      await KarkunDuties.updateAsync(_id, {
        $set: {
          karkunId,
          dutyId,
          shiftId,
          locationId,
          role,
          daysOfWeek,
        },
      });

      return KarkunDuties.findOneAsync(_id);
    },

    removeKarkunDuty: async (obj, { _id }) => KarkunDuties.removeAsync(_id),
  },
};

export default resolvers;
