import {
  Attendances,
  Committees,
  Duties,
  DutyLocations,
  DutyShifts,
  KarkunDuties,
  Teams,
} from 'meteor/idreesia-common/server/collections/hr';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// Returns the committee id to store, or null to clear it. Throws if the
// committee doesn't exist.
const resolveCommitteeId = async (committeeId: string | null | undefined) => {
  if (!committeeId) return null;
  const committee = await Committees.findOneAsync(committeeId);
  if (!committee) throw new Error('Please select a valid committee.');
  return committeeId;
};

const resolvers: ResolverMap = {
  DutyType: {
    committee: async dutyType =>
      dutyType.committeeId ? Committees.findOneAsync(dutyType.committeeId) : null,
    shifts: async dutyType =>
      DutyShifts.find({
        dutyId: { $eq: dutyType._id },
      }).fetchAsync(),
    locations: async dutyType =>
      DutyLocations.find(
        { dutyId: { $eq: dutyType._id } },
        { sort: { name: 1 } }
      ).fetchAsync(),
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

      const teamCount = await Teams.find({
        dutyId: { $eq: dutyType._id },
      }).countAsync();
      if (teamCount > 0) return false;

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
  },

  Mutation: {
    createDuty: async (
      obj,
      { name, isMehfilDuty, description, committeeId },
      { user }
    ) => {
      const validCommitteeId = await resolveCommitteeId(committeeId);
      const date = new Date();
      const dutyId = await Duties.insertAsync({
        name,
        isMehfilDuty,
        description,
        ...(validCommitteeId ? { committeeId: validCommitteeId } : {}),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Duties.findOneAsync(dutyId);
    },

    updateDuty: async (
      obj,
      { id, name, description, committeeId },
      { user }
    ) => {
      const date = new Date();
      const modifier: Record<string, Record<string, unknown>> = {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      };
      // Mehfil duty screens don't send committeeId; leave it untouched then.
      if (committeeId !== undefined) {
        const validCommitteeId = await resolveCommitteeId(committeeId);
        if (validCommitteeId) {
          modifier.$set.committeeId = validCommitteeId;
        } else {
          modifier.$unset = { committeeId: '' };
        }
      }
      await Duties.updateAsync(id, modifier);

      return Duties.findOneAsync(id);
    },

    removeDuty: async (obj, { _id }) => Duties.removeAsync(_id),
  },
};

export default resolvers;
