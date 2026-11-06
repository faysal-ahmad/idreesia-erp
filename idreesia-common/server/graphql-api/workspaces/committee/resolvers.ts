import { Committees } from 'meteor/idreesia-common/server/collections/hr';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/ensure-karkuns';

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
  };
}

const toWorkspaceKarkun = (person: PersonDocument) => ({
  _id: person._id,
  name: person.sharedData?.name,
  parentName: person.sharedData?.parentName,
  cnicNumber: person.sharedData?.cnicNumber,
  contactNumber1: person.sharedData?.contactNumber1,
  imageId: person.sharedData?.imageId,
  imageThumbnailId: person.sharedData?.imageThumbnailId,
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
      const people = (await loaders.common.people.loadMany(
        members.map(member => member.karkunId)
      )) as Array<PersonDocument | Error | null>;

      const rows = members.map((member, index) => {
        const person = people[index];
        const shared =
          person && !(person instanceof Error) ? person.sharedData : undefined;
        return {
          karkunId: member.karkunId,
          isCoordinator: !!member.isCoordinator,
          name: shared?.name,
          imageId: shared?.imageId,
          imageThumbnailId: shared?.imageThumbnailId,
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
      await ensureKarkuns([karkunId]);
      const added = await Committees.updateAsync(
        { _id: committeeId, 'members.karkunId': { $ne: karkunId } },
        {
          $push: { members: { karkunId } },
          $set: { updatedAt: new Date(), updatedBy: user._id },
        }
      );
      if (added === 0) {
        throw new Error('This person is already a member of the committee.');
      }

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

      await Committees.updateAsync(committeeId, {
        $pull: { members: { karkunId } },
        $set: { updatedAt: new Date(), updatedBy: user._id },
      });

      return Committees.findOneAsync(committeeId);
    },
  },
};

export default resolvers;
