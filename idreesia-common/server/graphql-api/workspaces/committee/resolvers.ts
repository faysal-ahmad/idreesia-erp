import { Committees } from 'meteor/idreesia-common/server/collections/hr';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import {
  addCommitteeMember,
  getCommitteeMemberAccess,
  getCommitteeMemberCounts,
  removeCommitteeMember,
  setCommitteeMemberCoordinator,
  setCommitteeMemberDiscussionAccess,
  type CommitteeDoc,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  type CommitteeDocument,
  type WorkspaceUser,
  assertMembersEnabled,
  getCoordinatedCommittee,
  getMemberCommittee,
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
    imageId?: string;
    imageThumbnailId?: string;
    imageKey?: string;
    imageThumbnailKey?: string;
  };
}

const toWorkspaceKarkun = (person: PersonDocument) => ({
  _id: person._id,
  name: person.sharedData?.name,
  parentName: person.sharedData?.parentName,
  cnicNumber: person.sharedData?.cnicNumber,
  contactNumber1: person.sharedData?.contactNumber1,
  ...getPersonImageUrls(person.sharedData),
});

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

    workspaceCommitteeById: async (obj, { committeeId }, { user }) =>
      getMemberCommittee(user, committeeId),

    // Mirrors the HR karkun search (karkuns of Multan), limited to
    // coordinators of the committee and to the fields needed to pick a person.
    workspaceCommitteeKarkunSearch: async (
      obj,
      { committeeId, name, cnicNumber, phoneNumber, pageIndex, pageSize },
      { user }
    ) => {
      const committee = await getCoordinatedCommittee(user, committeeId);
      assertMembersEnabled(committee);

      const multanCity = await Cities.findOneAsync({
        name: 'Multan',
        country: 'Pakistan',
      });
      if (!multanCity) return { data: [], totalResults: 0 };

      const result = (await People.searchPeople(
        {
          name,
          cnicNumber,
          phoneNumber,
          pageIndex,
          pageSize,
          cityId: multanCity._id,
        },
        { includeKarkuns: true }
      )) as { data: PersonDocument[]; totalResults: number };

      return {
        data: result.data.map(toWorkspaceKarkun),
        totalResults: result.totalResults,
      };
    },
  },

  Mutation: {
    workspaceAddCommitteeMember: async (
      obj,
      { committeeId, karkunId, role },
      { user }
    ) => {
      const committee = await getCoordinatedCommittee(user, committeeId);
      assertMembersEnabled(committee);
      if (role && role !== 'member' && role !== 'guest') {
        throw new Error('Only members and guests can be added from here.');
      }
      await addCommitteeMember(committeeId, karkunId, user._id, role);
      return Committees.findOneAsync(committeeId);
    },

    // Coordinators can remove regular members only; make a coordinator a
    // regular member first.
    workspaceRemoveCommitteeMember: async (
      obj,
      { committeeId, karkunId },
      { user }
    ) => {
      const committee = await getCoordinatedCommittee(user, committeeId);
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
      if (member.role === 'observer') {
        throw new Error('Observers cannot be removed from here.');
      }

      await removeCommitteeMember(committeeId, karkunId, user._id);
      return Committees.findOneAsync(committeeId);
    },

    workspaceSetCommitteeMemberDiscussionAccess: async (
      obj,
      { committeeId, karkunId, hasAccess },
      { user }
    ) => {
      const committee = await getCoordinatedCommittee(user, committeeId);
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
      { user }
    ) => {
      const committee = await getCoordinatedCommittee(user, committeeId);
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
        user._id
      );
      return true;
    },
  },
};

export default resolvers;
