import { Teams } from 'meteor/idreesia-common/server/collections/hr';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const ensureCoordinatorIsMember = (
  karkunIds: string[],
  coordinatorKarkunId: string | null | undefined
) => {
  if (coordinatorKarkunId && !karkunIds.includes(coordinatorKarkunId)) {
    throw new Error('The coordinator must be one of the team members.');
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
    coordinator: async (team, args, { loaders }) => {
      if (!team.coordinatorKarkunId) return null;
      return loaders.common.people.load(team.coordinatorKarkunId);
    },
  },

  Query: {
    allTeams: async () => Teams.find({}).fetchAsync(),
    teamById: async (obj, { id }) => Teams.findOneAsync(id),
  },

  Mutation: {
    createTeam: async (
      obj,
      { name, color, description, karkunIds, coordinatorKarkunId },
      { user }
    ) => {
      const memberKarkunIds = karkunIds ?? [];
      ensureCoordinatorIsMember(memberKarkunIds, coordinatorKarkunId);

      const date = new Date();
      const teamId = await Teams.insertAsync({
        name,
        color,
        description,
        karkunIds: memberKarkunIds,
        coordinatorKarkunId,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Teams.findOneAsync(teamId);
    },

    updateTeam: async (
      obj,
      { id, name, color, description, karkunIds, coordinatorKarkunId },
      { user }
    ) => {
      const setFields: Record<string, unknown> = {
        name,
        color,
        description,
        updatedAt: new Date(),
        updatedBy: user._id,
      };

      // karkunIds/coordinatorKarkunId are managed separately (from the
      // list page); only touch them here when this call actually sends
      // them, so a plain details save doesn't wipe out existing members.
      if (karkunIds !== undefined || coordinatorKarkunId !== undefined) {
        const existingTeam = await Teams.findOneAsync(id);
        const effectiveKarkunIds = karkunIds ?? existingTeam?.karkunIds ?? [];
        const effectiveCoordinatorKarkunId =
          coordinatorKarkunId !== undefined
            ? coordinatorKarkunId
            : existingTeam?.coordinatorKarkunId;
        ensureCoordinatorIsMember(effectiveKarkunIds, effectiveCoordinatorKarkunId);

        if (karkunIds !== undefined) setFields.karkunIds = karkunIds;
        if (coordinatorKarkunId !== undefined) {
          setFields.coordinatorKarkunId = coordinatorKarkunId;
        }
      }

      await Teams.updateAsync(id, { $set: setFields });

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
      const team = await Teams.findOneAsync(teamId);
      const update: Record<string, unknown> = {
        $pull: { karkunIds: karkunId },
      };

      // A karkun can't remain the coordinator once they're no longer a member.
      if (team?.coordinatorKarkunId === karkunId) {
        update.$unset = { coordinatorKarkunId: '' };
      }

      await Teams.updateAsync(teamId, update);

      return Teams.findOneAsync(teamId);
    },

    setTeamCoordinator: async (obj, { teamId, karkunId }) => {
      const team = await Teams.findOneAsync(teamId);
      const isCurrentCoordinator = team?.coordinatorKarkunId === karkunId;

      await Teams.updateAsync(teamId, {
        [isCurrentCoordinator ? '$unset' : '$set']: {
          coordinatorKarkunId: isCurrentCoordinator ? '' : karkunId,
        },
      });

      return Teams.findOneAsync(teamId);
    },
  },
};

export default resolvers;
