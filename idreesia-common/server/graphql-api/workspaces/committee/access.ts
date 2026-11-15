import { GraphQLError } from 'graphql';

import {
  CommitteeFeatureKeys,
  CommitteeMemberRoles,
  type CommitteeMemberRole,
} from 'meteor/idreesia-common/constants/organization';
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

/**
 * The user's role on the committee, or null when they are not on it. A
 * super-admin counts as a coordinator. A member entry with no role is a plain
 * member.
 */
export const getCommitteeRole = (
  user: WorkspaceUser | null | undefined,
  committee: CommitteeDocument
): CommitteeMemberRole | null => {
  if (isSuperAdmin(user)) return CommitteeMemberRoles.COORDINATOR;
  if (!canAccessWorkspaces(user)) return null;
  const member = (committee.members ?? []).find(
    entry => entry.karkunId === user!.personId
  );
  if (!member) return null;
  return (member.role as CommitteeMemberRole) || CommitteeMemberRoles.MEMBER;
};

/**
 * What `@checkCommitteeAccess` found out about the caller on a committee,
 * kept on the request context so the resolver does not load it again.
 */
export interface CommitteeAccess {
  committee: CommitteeDocument;
  role: CommitteeMemberRole;
  isCoordinator: boolean;
}

export interface CommitteeAccessContext {
  user?: WorkspaceUser | null;
  /** Filled by `@checkCommitteeAccess`, keyed by committee id. */
  committeeAccess?: Record<string, CommitteeAccess>;
}

/**
 * The access `@checkCommitteeAccess` recorded for the committee. A field that
 * needs it must carry the directive, so a missing entry is a schema mistake.
 */
export const getCommitteeAccess = (
  context: CommitteeAccessContext,
  committeeId: string
): CommitteeAccess => {
  const access = context.committeeAccess?.[committeeId];
  if (!access) {
    throw new Error(
      'Committee access was not checked. Add @checkCommitteeAccess to the field.'
    );
  }
  return access;
};

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

// Throws unless the committee has the Members feature enabled.
export const assertMembersEnabled = (committee: CommitteeDocument) => {
  const features = (committee.features as string[] | undefined) ?? [];
  if (!features.includes(CommitteeFeatureKeys.MEMBERS)) {
    throw new GraphQLError('Members is not enabled for this committee.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
};
