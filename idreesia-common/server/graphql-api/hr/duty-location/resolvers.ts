import {
  Duties,
  DutyLocations,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';
import { locationIsPlanned } from 'meteor/idreesia-common/server/business-logic/hr/duty-planning';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  DutyLocationType: {
    duty: async dutyLocationType =>
      Duties.findOneAsync(dutyLocationType.dutyId),
    usedCount: async dutyLocationType =>
      KarkunDuties.find({
        locationId: { $eq: dutyLocationType._id },
      }).countAsync(),
    canDelete: async dutyLocationType => {
      const usedCount = await KarkunDuties.find({
        locationId: { $eq: dutyLocationType._id },
      }).countAsync();
      if (usedCount > 0) return false;
      return !(await locationIsPlanned(dutyLocationType._id));
    },
  },

  Query: {
    allDutyLocations: async () =>
      DutyLocations.find({}, { sort: { dutyId: 1, name: 1 } }).fetchAsync(),

    dutyLocationsByDutyId: async (obj, { dutyId }) =>
      DutyLocations.find(
        { dutyId: { $eq: dutyId } },
        { sort: { name: 1 } }
      ).fetchAsync(),

    dutyLocationById: async (obj, { id }) => DutyLocations.findOneAsync(id),
  },

  Mutation: {
    createDutyLocation: async (obj, { name, dutyId }, { user }) => {
      const date = new Date();
      const dutyLocationId = await DutyLocations.insertAsync({
        name,
        dutyId,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return DutyLocations.findOneAsync(dutyLocationId);
    },

    updateDutyLocation: async (obj, { id, name, dutyId }, { user }) => {
      const date = new Date();
      await DutyLocations.updateAsync(id, {
        $set: {
          name,
          dutyId,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return DutyLocations.findOneAsync(id);
    },

    removeDutyLocation: async (obj, { _id }) => {
      const usedCount = await KarkunDuties.find({
        locationId: { $eq: _id },
      }).countAsync();

      if (usedCount > 0 || (await locationIsPlanned(_id))) {
        throw new Error(
          'This location cannot be deleted as it is currently in use.'
        );
      }

      return DutyLocations.removeAsync(_id);
    },
  },
};

export default resolvers;
