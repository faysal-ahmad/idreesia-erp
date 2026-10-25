import { Duties, Teams } from 'meteor/idreesia-common/server/collections/hr';
import {
  DAYS_OF_WEEK,
  isDayOfWeek,
} from 'meteor/idreesia-common/server/business-logic/hr/duty-planning-dates';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/ensure-karkuns';
import {
  ensureDutyDayAttendancesForTeam,
  teamIsAssigned,
} from 'meteor/idreesia-common/server/business-logic/hr/duty-planning';

const normalizeDaysOfWeek = (
  daysOfWeek: Array<string | null> | null | undefined
) => {
  const selected = new Set<string>();
  for (const day of daysOfWeek ?? []) {
    if (!day || !isDayOfWeek(day)) {
      throw new Error('Please select valid days.');
    }
    selected.add(day);
  }
  if (selected.size === 0) {
    throw new Error('Please select at least one day.');
  }
  return DAYS_OF_WEEK.filter(day => selected.has(day));
};

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const ensureDuty = async (dutyId: string | null | undefined) => {
  if (!dutyId) {
    throw new Error('Please select a duty for the team.');
  }
  const duty = await Duties.findOneAsync(dutyId);
  if (!duty || duty.isMehfilDuty) {
    throw new Error('Please select a valid duty.');
  }
};

const ensureDutyChangeIsAllowed = async (
  teamId: string,
  nextDutyId: string
) => {
  const existingTeam = await Teams.findOneAsync(teamId);
  if (!existingTeam) throw new Error('Team not found.');
  if (existingTeam.dutyId === nextDutyId) return;
  if (await teamIsAssigned(teamId)) {
    throw new Error(
      'This team is assigned in duty planning, so its duty cannot be changed.'
    );
  }
};

// Updates one member of a team, failing if the karkun is not a member.
const updateMember = async (
  teamId: string,
  karkunId: string,
  modifier: Record<string, unknown>
) => {
  const updated = await Teams.updateAsync(
    { _id: teamId, 'members.karkunId': karkunId },
    modifier
  );
  if (updated === 0) {
    throw new Error('This person is not a member of the team.');
  }
};

const resolvers: ResolverMap = {
  TeamType: {
    duty: async team => {
      if (!team.dutyId) return null;
      return Duties.findOneAsync(team.dutyId);
    },
  },

  TeamMemberType: {
    karkun: async (member, args, { loaders }) => {
      if (!member.karkunId) return null;
      return loaders.common.people.load(member.karkunId);
    },
  },

  Query: {
    allTeams: async () => Teams.find({}).fetchAsync(),
    teamById: async (obj, { id }) => Teams.findOneAsync(id),
  },

  Mutation: {
    createTeam: async (obj, { name, color, description, dutyId }, { user }) => {
      await ensureDuty(dutyId);

      const date = new Date();
      const teamId = await Teams.insertAsync({
        name,
        color,
        description,
        dutyId,
        members: [],
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Teams.findOneAsync(teamId);
    },

    updateTeam: async (
      obj,
      { id, name, color, description, dutyId },
      { user }
    ) => {
      await ensureDuty(dutyId);
      await ensureDutyChangeIsAllowed(id, dutyId);

      await Teams.updateAsync(id, {
        $set: {
          name,
          color,
          description,
          dutyId,
          updatedAt: new Date(),
          updatedBy: user._id,
        },
      });

      return Teams.findOneAsync(id);
    },

    removeTeam: async (obj, { _id }) => {
      if (await teamIsAssigned(_id)) {
        throw new Error(
          'This team is assigned in duty planning and cannot be deleted.'
        );
      }
      return Teams.removeAsync(_id);
    },

    addTeamMember: async (obj, { teamId, karkunId, daysOfWeek }) => {
      const team = await Teams.findOneAsync(teamId);
      if (!team) throw new Error('Team not found.');
      await ensureKarkuns([karkunId]);

      const days = normalizeDaysOfWeek(daysOfWeek);
      await ensureDutyDayAttendancesForTeam(teamId);
      const added = await Teams.updateAsync(
        { _id: teamId, 'members.karkunId': { $ne: karkunId } },
        { $push: { members: { karkunId, daysOfWeek: days } } }
      );
      if (added === 0) {
        throw new Error('This person is already a member of the team.');
      }

      return Teams.findOneAsync(teamId);
    },

    updateTeamMemberDays: async (obj, { teamId, karkunId, daysOfWeek }) => {
      const days = normalizeDaysOfWeek(daysOfWeek);
      await ensureDutyDayAttendancesForTeam(teamId);
      await updateMember(teamId, karkunId, {
        $set: { 'members.$.daysOfWeek': days },
      });

      return Teams.findOneAsync(teamId);
    },

    removeTeamMember: async (obj, { teamId, karkunId }) => {
      const team = await Teams.findOneAsync(teamId);
      if (!team) throw new Error('Team not found.');
      await ensureDutyDayAttendancesForTeam(teamId);
      await Teams.updateAsync(teamId, {
        $pull: { members: { karkunId } },
      });

      return Teams.findOneAsync(teamId);
    },

    addTeamCoordinator: async (obj, { teamId, karkunId }) => {
      await updateMember(teamId, karkunId, {
        $set: { 'members.$.isCoordinator': true },
      });

      return Teams.findOneAsync(teamId);
    },

    removeTeamCoordinator: async (obj, { teamId, karkunId }) => {
      await updateMember(teamId, karkunId, {
        $unset: { 'members.$.isCoordinator': '' },
      });

      return Teams.findOneAsync(teamId);
    },
  },
};

export default resolvers;
