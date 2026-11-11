import { Committees, Duties } from 'meteor/idreesia-common/server/collections/hr';
import { CommitteeFeatures } from 'meteor/idreesia-common/constants/organization';
import {
  addCommitteeMember,
  disableCommitteeFeature,
  enableCommitteeFeature,
  getCommitteeMemberAccess,
  removeCommitteeMember,
  getCommitteeMemberCounts,
  getCommitteeMembersPage,
  setCommitteeMemberRole,
  setCommitteeMemberDiscussionAccess,
  type CommitteeDoc,
  type CommitteeMemberAccess,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// Member access is looked up per committee, at most once per request, and
// only when one of the access fields is asked for.
type MemberWithCommittee = { karkunId: string; committee: CommitteeDoc };
const accessCache = new WeakMap<
  object,
  Map<string, Promise<Map<string, CommitteeMemberAccess>>>
>();

const getMemberAccess = async (
  member: MemberWithCommittee,
  context: object
) => {
  let byCommittee = accessCache.get(context);
  if (!byCommittee) {
    byCommittee = new Map();
    accessCache.set(context, byCommittee);
  }
  const { committee } = member;
  let access = byCommittee.get(committee._id);
  if (!access) {
    access = getCommitteeMemberAccess(committee);
    byCommittee.set(committee._id, access);
  }
  return (await access).get(member.karkunId);
};

const resolvers: ResolverMap = {
  CommitteeType: {
    features: committee => committee.features ?? [],
    memberCount: (committee: CommitteeDoc) =>
      getCommitteeMemberCounts(committee).memberCount,
    guestCount: (committee: CommitteeDoc) =>
      getCommitteeMemberCounts(committee).guestCount,
    observerCount: (committee: CommitteeDoc) =>
      getCommitteeMemberCounts(committee).observerCount,
    members: (committee: CommitteeDoc) =>
      (committee.members ?? []).map(member => ({ ...member, committee })),
  },

  CommitteeMemberType: {
    karkun: async (member, args, { loaders }) => {
      if (!member.karkunId) return null;
      return loaders.common.people.load(member.karkunId);
    },
    role: (member: { role?: string }) => member.role ?? 'member',
    isCoordinator: (member: { role?: string }) => member.role === 'coordinator',
    hasLoginAccount: async (member: MemberWithCommittee, args, context) =>
      (await getMemberAccess(member, context))?.hasLoginAccount ?? false,
    hasChatAccount: async (member: MemberWithCommittee, args, context) =>
      (await getMemberAccess(member, context))?.hasChatAccount ?? false,
    hasDiscussionAccess: async (member: MemberWithCommittee, args, context) =>
      (await getMemberAccess(member, context))?.hasDiscussionAccess ?? null,
  },

  Query: {
    allCommittees: async () =>
      Committees.find({}, { sort: { name: 1 } }).fetchAsync(),
    committeeById: async (obj, { id }) => Committees.findOneAsync(id),
    allCommitteeFeatures: async () => CommitteeFeatures,
    committeeMembers: async (
      obj,
      { committeeId, roles, pageIndex, pageSize }
    ) => {
      const committee = (await Committees.findOneAsync(
        committeeId
      )) as unknown as CommitteeDoc | undefined;
      if (!committee) throw new Error('Committee not found.');

      const page = await getCommitteeMembersPage(
        committee,
        roles,
        pageIndex,
        pageSize
      );
      // The access fields are looked up for the people on this page only.
      const pageCommittee = { ...committee, members: page.data };
      return {
        totalResults: page.totalResults,
        data: page.data.map(member => ({ ...member, committee: pageCommittee })),
      };
    },
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

    addCommitteeMember: async (
      obj,
      { committeeId, karkunId, role },
      { user }
    ) => {
      await addCommitteeMember(committeeId, karkunId, user._id, role);
      return Committees.findOneAsync(committeeId);
    },

    removeCommitteeMember: async (obj, { committeeId, karkunId }, { user }) => {
      await removeCommitteeMember(committeeId, karkunId, user._id);
      return Committees.findOneAsync(committeeId);
    },

    setCommitteeMemberDiscussionAccess: async (
      obj,
      { committeeId, karkunId, hasAccess }
    ) => {
      const committee = await Committees.findOneAsync(committeeId);
      if (!committee) throw new Error('Committee not found.');
      return setCommitteeMemberDiscussionAccess(
        committee as unknown as CommitteeDoc,
        karkunId,
        hasAccess
      );
    },

    setCommitteeMemberRole: async (
      obj,
      { committeeId, karkunId, role },
      { user }
    ) => {
      await setCommitteeMemberRole(committeeId, karkunId, role, user._id);
      return Committees.findOneAsync(committeeId);
    },

    enableCommitteeFeature: async (
      obj,
      { committeeId, featureKey },
      { user }
    ) => enableCommitteeFeature(committeeId, featureKey, user._id),

    disableCommitteeFeature: async (
      obj,
      { committeeId, featureKey },
      { user }
    ) => disableCommitteeFeature(committeeId, featureKey, user._id),
  },
};

export default resolvers;
