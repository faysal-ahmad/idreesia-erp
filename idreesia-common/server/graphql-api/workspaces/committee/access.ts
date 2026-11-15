import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/organization';
import { Committees } from 'meteor/idreesia-common/server/collections/hr';
import { isSuperAdmin } from 'meteor/idreesia-common/server/business-logic/admin/users/super-admin';

export interface WorkspaceUser {
  _id?: string;
  username?: string;
  personId?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
}

interface CommitteeMember {
  karkunId: string;
  role?: string;
}

export interface CommitteeDocument {
  _id: string;
  name?: string;
  members?: CommitteeMember[];
  [key: string]: unknown;
}

const canAccessWorkspaces = (user?: WorkspaceUser | null) =>
  !!user && !user.locked && !!user.personId;

export const isCommitteeMember = (
  user: WorkspaceUser | null | undefined,
  committee: CommitteeDocument
) =>
  isSuperAdmin(user) ||
  (canAccessWorkspaces(user) &&
    (committee.members ?? []).some(
      member => member.karkunId === user!.personId
    ));

export const isCommitteeCoordinator = (
  user: WorkspaceUser | null | undefined,
  committee: CommitteeDocument
) =>
  isSuperAdmin(user) ||
  (canAccessWorkspaces(user) &&
    (committee.members ?? []).some(
      member => member.karkunId === user!.personId &&
        member.role === 'coordinator'
    ));

// Returns the committees the user is currently a member of (all committees
// for a super-admin).
export const getUserCommittees = async (
  user: WorkspaceUser | null | undefined
) => {
  if (isSuperAdmin(user)) {
    return Committees.find({}, { sort: { name: 1 } }).fetchAsync();
  }
  if (!canAccessWorkspaces(user)) return [];
  return Committees.find(
    { 'members.karkunId': user!.personId },
    { sort: { name: 1 } }
  ).fetchAsync();
};

// Loads a committee and verifies the user is a member of it.
export const getMemberCommittee = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string
) => {
  const committee = (await Committees.findOneAsync(
    committeeId
  )) as CommitteeDocument | undefined;
  if (!committee || !isCommitteeMember(user, committee)) return null;
  return committee;
};

// Loads a committee and verifies the user is one of its coordinators.
export const getCoordinatedCommittee = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string
) => {
  const committee = (await Committees.findOneAsync(
    committeeId
  )) as CommitteeDocument | undefined;
  if (!committee || !isCommitteeCoordinator(user, committee)) {
    throw new Error('Only coordinators of this committee can do this.');
  }
  return committee;
};

// Throws unless the committee has the Members feature enabled.
export const assertMembersEnabled = (committee: CommitteeDocument) => {
  const features = (committee.features as string[] | undefined) ?? [];
  if (!features.includes(CommitteeFeatureKeys.MEMBERS)) {
    throw new GraphQLError('Members is not enabled for this committee.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
};
