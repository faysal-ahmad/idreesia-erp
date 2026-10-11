import { Committees, Duties } from 'meteor/idreesia-common/server/collections/hr';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/ensure-karkuns';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// Updates one member of a committee, failing if the karkun is not a member.
const updateMember = async (
  committeeId: string,
  karkunId: string,
  modifier: Record<string, unknown>
) => {
  const updated = await Committees.updateAsync(
    { _id: committeeId, 'members.karkunId': karkunId },
    modifier
  );
  if (updated === 0) {
    throw new Error('This person is not a member of the committee.');
  }
};

const resolvers: ResolverMap = {
  CommitteeMemberType: {
    karkun: async (member, args, { loaders }) => {
      if (!member.karkunId) return null;
      return loaders.common.people.load(member.karkunId);
    },
  },

  Query: {
    allCommittees: async () =>
      Committees.find({}, { sort: { name: 1 } }).fetchAsync(),
    committeeById: async (obj, { id }) => Committees.findOneAsync(id),
  },

  Mutation: {
    createCommittee: async (obj, { name, color, description }, { user }) => {
      const date = new Date();
      const committeeId = await Committees.insertAsync({
        name,
        color,
        description,
        members: [],
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Committees.findOneAsync(committeeId);
    },

    updateCommittee: async (
      obj,
      { id, name, color, description },
      { user }
    ) => {
      await Committees.updateAsync(id, {
        $set: {
          name,
          color,
          description,
          updatedAt: new Date(),
          updatedBy: user._id,
        },
      });

      return Committees.findOneAsync(id);
    },

    removeCommittee: async (obj, { _id }) => {
      const dutyCount = await Duties.find({ committeeId: _id }).countAsync();
      if (dutyCount > 0) {
        throw new Error(
          'This committee is responsible for one or more duties and cannot be deleted.'
        );
      }
      return Committees.removeAsync(_id);
    },

    addCommitteeMember: async (obj, { committeeId, karkunId }) => {
      const committee = await Committees.findOneAsync(committeeId);
      if (!committee) throw new Error('Committee not found.');
      await ensureKarkuns([karkunId]);
      const added = await Committees.updateAsync(
        { _id: committeeId, 'members.karkunId': { $ne: karkunId } },
        { $push: { members: { karkunId } } }
      );
      if (added === 0) {
        throw new Error('This person is already a member of the committee.');
      }

      return Committees.findOneAsync(committeeId);
    },

    removeCommitteeMember: async (obj, { committeeId, karkunId }) => {
      await Committees.updateAsync(committeeId, {
        $pull: { members: { karkunId } },
      });

      return Committees.findOneAsync(committeeId);
    },

    addCommitteeCoordinator: async (obj, { committeeId, karkunId }) => {
      await updateMember(committeeId, karkunId, {
        $set: { 'members.$.isCoordinator': true },
      });

      return Committees.findOneAsync(committeeId);
    },

    removeCommitteeCoordinator: async (obj, { committeeId, karkunId }) => {
      await updateMember(committeeId, karkunId, {
        $unset: { 'members.$.isCoordinator': '' },
      });

      return Committees.findOneAsync(committeeId);
    },
  },
};

export default resolvers;
