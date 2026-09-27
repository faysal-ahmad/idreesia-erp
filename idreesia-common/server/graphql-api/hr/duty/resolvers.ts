import {
  Duties,
  DutyShifts,
  KarkunDuties,
  Attendances,
} from 'meteor/idreesia-common/server/collections/hr';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  DutyType: {
    shifts: async dutyType =>
      DutyShifts.find({
        dutyId: { $eq: dutyType._id },
      }).fetchAsync(),
    canDelete: async dutyType => {
      // Check if this duty is currently assigned to a karkun
      const karkunDutiesCount = await KarkunDuties.find({
        dutyId: { $eq: dutyType._id },
      }).countAsync();
      if (karkunDutiesCount > 0) return false;

      // Check if we have marked attendance against this duty
      const attendanceCount = await Attendances.find({
        dutyId: { $eq: dutyType._id },
      }).countAsync();
      if (attendanceCount > 0) return false;

      return true;
    },
  },

  Query: {
    allMSDuties: async () =>
      Duties.find(
        { isMehfilDuty: { $eq: false } },
        { sort: { name: 1 } }
      ).fetchAsync(),

    allMehfilDuties: async () =>
      Duties.find(
        { isMehfilDuty: { $eq: true } },
        { sort: { name: 1 } }
      ).fetchAsync(),

    dutyById: async (obj, { id }) => Duties.findOneAsync(id),
  },

  Mutation: {
    createDuty: async (
      obj,
      { name, isMehfilDuty, description, attendanceSheet },
      { user }
    ) => {
      const date = new Date();
      const dutyId = await Duties.insertAsync({
        name,
        isMehfilDuty,
        description,
        attendanceSheet,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Duties.findOneAsync(dutyId);
    },

    updateDuty: async (
      obj,
      { id, name, description, attendanceSheet },
      { user }
    ) => {
      const date = new Date();
      await Duties.updateAsync(id, {
        $set: {
          name,
          description,
          attendanceSheet,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Duties.findOneAsync(id);
    },

    removeDuty: async (obj, { _id }) => Duties.removeAsync(_id),
  },
};

export default resolvers;
