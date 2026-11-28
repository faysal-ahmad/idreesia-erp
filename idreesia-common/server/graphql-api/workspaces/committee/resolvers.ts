import {
  Committees,
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import {
  addCommitteeMember,
  getCommitteeMemberAccess,
  getCommitteeMemberCounts,
  removeCommitteeMember,
  searchCommitteeKarkuns,
  setCommitteeMemberCoordinator,
  setCommitteeMemberDiscussionAccess,
  type CommitteeDoc,
} from 'meteor/idreesia-common/server/business-logic/admin/committee';

import {
  type CommitteeDocument,
  type WorkspaceUser,
  assertMembersEnabled,
  getCommitteeAccess,
  getUserCommittees,
  isCommitteeCoordinator,
} from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

interface PersonDocument {
  _id: string;
  sharedData?: {
    name?: string;
    parentName?: string;
    cnicNumber?: string;
    contactNumber1?: string;
    contactNumber2?: string;
    imageKey?: string;
    imageThumbnailKey?: string;
  };
}

const resolvers: ResolverMap = {
  WorkspaceCommitteeType: {
    features: (committee: CommitteeDocument) =>
      (committee.features as string[] | undefined) ?? [],

    memberCount: (committee: CommitteeDocument) =>
      getCommitteeMemberCounts(committee as unknown as CommitteeDoc)
        .memberCount,
    guestCount: (committee: CommitteeDocument) =>
      getCommitteeMemberCounts(committee as unknown as CommitteeDoc)
        .guestCount,
    observerCount: (committee: CommitteeDocument) =>
      getCommitteeMemberCounts(committee as unknown as CommitteeDoc)
        .observerCount,

    canManageMembers: (committee: CommitteeDocument, args, { user }) =>
      isCommitteeCoordinator(user as WorkspaceUser, committee),

    // Members sorted with coordinators first, then by name. Only the fields
    // a committee member needs are exposed (no CNIC, addresses, etc).
    // Only for committees with the Members feature enabled.
    members: async (committee: CommitteeDocument, args, { loaders }) => {
      assertMembersEnabled(committee);
      const members = committee.members ?? [];
      const personIds = members.map(member => member.karkunId);
      const people = (await loaders.common.people.loadMany(
        personIds
      )) as Array<PersonDocument | Error | null>;
      const access = await getCommitteeMemberAccess(
        committee as unknown as CommitteeDoc
      );

      const rows = members.map((member, index) => {
        const person = people[index];
        const shared =
          person && !(person instanceof Error) ? person.sharedData : undefined;
        const memberAccess = access.get(member.karkunId);
        return {
          karkunId: member.karkunId,
          isCoordinator: member.role === 'coordinator',
          role: member.role ?? 'member',
          hasLoginAccount: memberAccess?.hasLoginAccount ?? false,
          hasChatAccount: memberAccess?.hasChatAccount ?? false,
          hasDiscussionAccess: memberAccess?.hasDiscussionAccess ?? null,
          name: shared?.name,
          ...getPersonImageUrls(shared),
          contactNumber1: shared?.contactNumber1,
          contactNumber2: shared?.contactNumber2,
        };
      });

      return rows.sort((a, b) => {
        if (a.isCoordinator !== b.isCoordinator) return a.isCoordinator ? -1 : 1;
        return (a.name ?? '').localeCompare(b.name ?? '');
      });
    },
  },

  Query: {
    myCommittees: async (obj, args, { user }) => getUserCommittees(user),

    myCommitteeLocations: async (obj, args, { user }) => {
      const committees = await getUserCommittees(user);
      const locationIds = Array.from(
        new Set(
          committees
            .map(committee => (committee as { locationId?: string }).locationId)
            .filter((id): id is string => !!id)
        )
      );
      if (locationIds.length === 0) return [];

      const locations = await OrgLocations.find({
        _id: { $in: locationIds },
      }).fetchAsync();
      const allIds = new Set<string>(locationIds);
      locations.forEach(location =>
        (location.allParentIds ?? []).forEach(id => allIds.add(id))
      );

      return OrgLocations.find(
        { _id: { $in: Array.from(allIds) } },
        { sort: { name: 1 } }
      ).fetchAsync();
    },

    workspaceCommitteeById: async (obj, { committeeId }, context) =>
      getCommitteeAccess(context, committeeId).committee,

    pagedWorkspaceCommitteeKarkuns: async (
      obj,
      { committeeId, name, cnicNumber, phoneNumber, pageIndex, pageSize },
      context
    ) => {
      const { committee } = getCommitteeAccess(context, committeeId);
      assertMembersEnabled(committee);
      return searchCommitteeKarkuns({ name, cnicNumber, phoneNumber, pageIndex, pageSize });
    },
  },

  Mutation: {
    workspaceAddCommitteeMember: async (
      obj,
      { committeeId, karkunId, role },
      context
    ) => {
      const { committee } = getCommitteeAccess(context, committeeId);
      assertMembersEnabled(committee);
      if (role && role !== 'member' && role !== 'guest') {
        throw new Error('Only members and guests can be added from here.');
      }
      await addCommitteeMember(committeeId, karkunId, context.user._id, role);
      return Committees.findOneAsync(committeeId);
    },

    // Coordinators can remove regular members only; make a coordinator a
    // regular member first.
    workspaceRemoveCommitteeMember: async (
      obj,
      { committeeId, karkunId },
      context
    ) => {
      const { committee } = getCommitteeAccess(context, committeeId);
      assertMembersEnabled(committee);
      const member = (committee.members ?? []).find(
        m => m.karkunId === karkunId
      );
      if (!member) {
        throw new Error('This person is not a member of the committee.');
      }
      if (member.role === 'coordinator') {
        throw new Error('Coordinators cannot be removed from here.');
      }
      if (member.role === 'observer' || member.role === 'inherited_observer') {
        throw new Error('Observers cannot be removed from here.');
      }

      await removeCommitteeMember(committeeId, karkunId, context.user._id);
      return Committees.findOneAsync(committeeId);
    },

    workspaceSetCommitteeMemberDiscussionAccess: async (
      obj,
      { committeeId, karkunId, hasAccess },
      context
    ) => {
      const { committee } = getCommitteeAccess(context, committeeId);
      return setCommitteeMemberDiscussionAccess(
        committee as unknown as CommitteeDoc,
        karkunId,
        hasAccess
      );
    },

    // Coordinators make members coordinators, or regular members again.
    workspaceSetCommitteeMemberCoordinator: async (
      obj,
      { committeeId, karkunId, isCoordinator },
      context
    ) => {
      const { committee } = getCommitteeAccess(context, committeeId);
      assertMembersEnabled(committee);
      const members = committee.members ?? [];
      if (!members.some(m => m.karkunId === karkunId)) {
        throw new Error('This person is not a member of the committee.');
      }
      if (
        !isCoordinator &&
        members.some(
          m => m.karkunId === karkunId && m.role === 'coordinator'
        ) &&
        members.filter(m => m.role === 'coordinator').length <= 1
      ) {
        throw new Error('A committee needs at least one coordinator.');
      }

      await setCommitteeMemberCoordinator(
        committeeId,
        karkunId,
        !!isCoordinator,
        context.user._id
      );
      return true;
    },
  },
};

export default resolvers;
