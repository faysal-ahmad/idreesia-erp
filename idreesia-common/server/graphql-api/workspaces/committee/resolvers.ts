import { Committees } from 'meteor/idreesia-common/server/collections/hr';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import {
  addCommitteeMember,
  getCommitteeMemberAccess,
  removeCommitteeMember,
  setCommitteeMemberDiscussionAccess,
  type CommitteeDoc,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  type CommitteeDocument,
  type WorkspaceUser,
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

    canManageMembers: (committee: CommitteeDocument, args, { user }) =>
      isCommitteeCoordinator(user as WorkspaceUser, committee),

    // Members sorted with coordinators first, then by name. Only the fields
    // a committee member needs are exposed (no CNIC, addresses, etc).
    members: async (committee: CommitteeDocument, args, { loaders }) => {
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
          isCoordinator: !!member.isCoordinator,
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
      await getCoordinatedCommittee(user, committeeId);

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
      { committeeId, karkunId },
      { user }
    ) => {
      await getCoordinatedCommittee(user, committeeId);
      await addCommitteeMember(committeeId, karkunId, user._id);
      return Committees.findOneAsync(committeeId);
    },

    // Coordinators can remove regular members only. Coordinator status is
    // managed from HR > Committees.
    workspaceRemoveCommitteeMember: async (
      obj,
      { committeeId, karkunId },
      { user }
    ) => {
      const committee = await getCoordinatedCommittee(user, committeeId);
      const member = (committee.members ?? []).find(
        m => m.karkunId === karkunId
      );
      if (!member) {
        throw new Error('This person is not a member of the committee.');
      }
      if (member.isCoordinator) {
        throw new Error('Coordinators cannot be removed from here.');
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
  },
};

export default resolvers;
