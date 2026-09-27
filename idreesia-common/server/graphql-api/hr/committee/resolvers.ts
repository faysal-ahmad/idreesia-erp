import { Committees } from 'meteor/idreesia-common/server/collections/hr';

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
    throw new Error('Coordinators must be members of the committee.');
  }
};

const resolvers: ResolverMap = {
  CommitteeType: {
    members: async (committee, args, { loaders }) => {
      const people = await loaders.common.people.loadMany(
        committee.karkunIds || []
      );
      return people.filter(
        (person: unknown) => person && !(person instanceof Error)
      );
    },
    coordinators: async (committee, args, { loaders }) => {
      const people = await loaders.common.people.loadMany(
        committee.coordinatorKarkunIds || []
      );
      return people.filter(
        (person: unknown) => person && !(person instanceof Error)
      );
    },
  },

  Query: {
    allCommittees: async () => Committees.find({}).fetchAsync(),
    committeeById: async (obj, { id }) => Committees.findOneAsync(id),
  },

  Mutation: {
    createCommittee: async (
      obj,
      { name, color, description, karkunIds, coordinatorKarkunIds },
      { user }
    ) => {
      const memberKarkunIds = karkunIds ?? [];
      const memberCoordinatorKarkunIds = coordinatorKarkunIds ?? [];
      ensureCoordinatorsAreMembers(memberKarkunIds, memberCoordinatorKarkunIds);

      const date = new Date();
      const committeeId = await Committees.insertAsync({
        name,
        color,
        description,
        karkunIds: memberKarkunIds,
        coordinatorKarkunIds: memberCoordinatorKarkunIds,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Committees.findOneAsync(committeeId);
    },

    updateCommittee: async (
      obj,
      { id, name, color, description, karkunIds, coordinatorKarkunIds },
      { user }
    ) => {
      const setFields: Record<string, unknown> = {
        name,
        color,
        description,
        updatedAt: new Date(),
        updatedBy: user._id,
      };

      // karkunIds/coordinatorKarkunIds are managed separately (from the
      // list page); only touch them here when this call actually sends
      // them, so a plain details save doesn't wipe out existing members.
      if (karkunIds !== undefined || coordinatorKarkunIds !== undefined) {
        const existingCommittee = await Committees.findOneAsync(id);
        const effectiveKarkunIds =
          karkunIds ?? existingCommittee?.karkunIds ?? [];
        const effectiveCoordinatorKarkunIds =
          coordinatorKarkunIds ?? existingCommittee?.coordinatorKarkunIds ?? [];
        ensureCoordinatorsAreMembers(
          effectiveKarkunIds,
          effectiveCoordinatorKarkunIds
        );

        if (karkunIds !== undefined) setFields.karkunIds = karkunIds;
        if (coordinatorKarkunIds !== undefined) {
          setFields.coordinatorKarkunIds = coordinatorKarkunIds;
        }
      }

      await Committees.updateAsync(id, { $set: setFields });

      return Committees.findOneAsync(id);
    },

    removeCommittee: async (obj, { _id }) => Committees.removeAsync(_id),

    addCommitteeMember: async (obj, { committeeId, karkunId }) => {
      await Committees.updateAsync(committeeId, {
        $addToSet: { karkunIds: karkunId },
      });

      return Committees.findOneAsync(committeeId);
    },

    removeCommitteeMember: async (obj, { committeeId, karkunId }) => {
      // A karkun can't remain a coordinator once they're no longer a member.
      await Committees.updateAsync(committeeId, {
        $pull: { karkunIds: karkunId, coordinatorKarkunIds: karkunId },
      });

      return Committees.findOneAsync(committeeId);
    },

    addCommitteeCoordinator: async (obj, { committeeId, karkunId }) => {
      await Committees.updateAsync(committeeId, {
        $addToSet: { coordinatorKarkunIds: karkunId },
      });

      return Committees.findOneAsync(committeeId);
    },

    removeCommitteeCoordinator: async (obj, { committeeId, karkunId }) => {
      await Committees.updateAsync(committeeId, {
        $pull: { coordinatorKarkunIds: karkunId },
      });

      return Committees.findOneAsync(committeeId);
    },
  },
};

export default resolvers;
