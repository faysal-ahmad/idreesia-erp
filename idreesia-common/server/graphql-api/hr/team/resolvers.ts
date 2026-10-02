import { Duties, Teams } from 'meteor/idreesia-common/server/collections/hr';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const ensureCoordinatorsAreMembers = (
  karkunIds: string[],
  coordinatorKarkunIds: string[]
) => {
  const nonMemberCoordinatorId = coordinatorKarkunIds.find(
    coordinatorKarkunId => !karkunIds.includes(coordinatorKarkunId)
  );
  if (nonMemberCoordinatorId) {
    throw new Error('Coordinators must be members of the team.');
  }
};

const ensureDuty = async (dutyId: string | null | undefined) => {
  if (!dutyId) return;
  const duty = await Duties.findOneAsync(dutyId);
  if (!duty || duty.isMehfilDuty) {
    throw new Error('Please select a valid duty.');
  }
};

const resolvers: ResolverMap = {
  TeamType: {
    members: async (team, args, { loaders }) => {
      const people = await loaders.common.people.loadMany(
        team.karkunIds || []
      );
      return people.filter(
        (person: unknown) => person && !(person instanceof Error)
      );
    },
    coordinators: async (team, args, { loaders }) => {
      const people = await loaders.common.people.loadMany(
        team.coordinatorKarkunIds || []
      );
      return people.filter(
        (person: unknown) => person && !(person instanceof Error)
      );
    },
    duty: async team => {
      if (!team.dutyId) return null;
      return Duties.findOneAsync(team.dutyId);
    },
  },

  Query: {
    allTeams: async () => Teams.find({}).fetchAsync(),
    teamById: async (obj, { id }) => Teams.findOneAsync(id),
  },

  Mutation: {
    createTeam: async (
      obj,
      { name, color, description, dutyId, karkunIds, coordinatorKarkunIds },
      { user }
    ) => {
      const memberKarkunIds = karkunIds ?? [];
      const memberCoordinatorKarkunIds = coordinatorKarkunIds ?? [];
      ensureCoordinatorsAreMembers(memberKarkunIds, memberCoordinatorKarkunIds);
      await ensureDuty(dutyId);

      const date = new Date();
      const teamId = await Teams.insertAsync({
        name,
        color,
        description,
        ...(dutyId ? { dutyId } : {}),
        karkunIds: memberKarkunIds,
        coordinatorKarkunIds: memberCoordinatorKarkunIds,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Teams.findOneAsync(teamId);
    },

    updateTeam: async (
      obj,
      { id, name, color, description, dutyId, karkunIds, coordinatorKarkunIds },
      { user }
    ) => {
      await ensureDuty(dutyId);

      const setFields: Record<string, unknown> = {
        name,
        color,
        description,
        updatedAt: new Date(),
        updatedBy: user._id,
      };
      const unsetFields: Record<string, string> = {};

      if (dutyId) {
        setFields.dutyId = dutyId;
      } else if (dutyId === null) {
        unsetFields.dutyId = '';
      }

      // karkunIds/coordinatorKarkunIds are managed separately (from the
      // list page); only touch them here when this call actually sends
      // them, so a plain details save doesn't wipe out existing members.
      if (karkunIds !== undefined || coordinatorKarkunIds !== undefined) {
        const existingTeam = await Teams.findOneAsync(id);
        const effectiveKarkunIds = karkunIds ?? existingTeam?.karkunIds ?? [];
        const effectiveCoordinatorKarkunIds =
          coordinatorKarkunIds ?? existingTeam?.coordinatorKarkunIds ?? [];
        ensureCoordinatorsAreMembers(
          effectiveKarkunIds,
          effectiveCoordinatorKarkunIds
        );

        if (karkunIds !== undefined) setFields.karkunIds = karkunIds;
        if (coordinatorKarkunIds !== undefined) {
          setFields.coordinatorKarkunIds = coordinatorKarkunIds;
        }
      }

      const update: Record<string, unknown> = { $set: setFields };
      if (Object.keys(unsetFields).length > 0) {
        update.$unset = unsetFields;
      }

      await Teams.updateAsync(id, update);

      return Teams.findOneAsync(id);
    },

    removeTeam: async (obj, { _id }) => Teams.removeAsync(_id),

    addTeamMember: async (obj, { teamId, karkunId }) => {
      await Teams.updateAsync(teamId, {
        $addToSet: { karkunIds: karkunId },
      });

      return Teams.findOneAsync(teamId);
    },

    removeTeamMember: async (obj, { teamId, karkunId }) => {
      // A karkun can't remain a coordinator once they're no longer a member.
      await Teams.updateAsync(teamId, {
        $pull: { karkunIds: karkunId, coordinatorKarkunIds: karkunId },
      });

      return Teams.findOneAsync(teamId);
    },

    addTeamCoordinator: async (obj, { teamId, karkunId }) => {
      const team = await Teams.findOneAsync(teamId);
      ensureCoordinatorsAreMembers(team?.karkunIds ?? [], [karkunId]);

      await Teams.updateAsync(teamId, {
        $addToSet: { coordinatorKarkunIds: karkunId },
      });

      return Teams.findOneAsync(teamId);
    },

    removeTeamCoordinator: async (obj, { teamId, karkunId }) => {
      await Teams.updateAsync(teamId, {
        $pull: { coordinatorKarkunIds: karkunId },
      });

      return Teams.findOneAsync(teamId);
    },
  },
};

export default resolvers;
