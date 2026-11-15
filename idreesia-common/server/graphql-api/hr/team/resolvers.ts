import { Duties, Teams } from 'meteor/idreesia-common/server/collections/hr';
import { teamIsAssigned } from 'meteor/idreesia-common/server/business-logic/hr/duty-planning';
import {
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
  updateTeamMemberDays,
} from 'meteor/idreesia-common/server/business-logic/hr/teams';

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
      await addTeamMember(teamId, karkunId, daysOfWeek);
      return Teams.findOneAsync(teamId);
    },

    updateTeamMemberDays: async (obj, { teamId, karkunId, daysOfWeek }) => {
      await updateTeamMemberDays(teamId, karkunId, daysOfWeek);
      return Teams.findOneAsync(teamId);
    },

    removeTeamMember: async (obj, { teamId, karkunId }) => {
      await removeTeamMember(teamId, karkunId);
      return Teams.findOneAsync(teamId);
    },

    addTeamCoordinator: async (obj, { teamId, karkunId }) => {
      await updateTeamMember(teamId, karkunId, {
        $set: { 'members.$.isCoordinator': true },
      });

      return Teams.findOneAsync(teamId);
    },

    removeTeamCoordinator: async (obj, { teamId, karkunId }) => {
      await updateTeamMember(teamId, karkunId, {
        $unset: { 'members.$.isCoordinator': '' },
      });

      return Teams.findOneAsync(teamId);
    },
  },
};

export default resolvers;
