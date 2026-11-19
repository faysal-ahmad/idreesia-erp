import { GraphQLError } from 'graphql';

import {
  CommitteeMemberRoles,
  type CommitteeMemberRole,
} from 'meteor/idreesia-common/constants/organization';
import {
  getCommitteeChatGroupId,
  type CommitteeDoc,
} from 'meteor/idreesia-common/server/business-logic/admin/committee';

import {
  getCommitteeAccess,
  getCommitteeRole,
  getMemberCommittee,
  type CommitteeAccessContext,
  type WorkspaceUser,
} from '../committee/access';

/**
 * The chat group of the committee's discussion, for a resolver: who may call
 * the field is decided by `@checkCommitteeAccess` in the schema. Here the
 * committee must also have Discussions enabled.
 */
export const getDiscussionChatGroupId = (
  context: CommitteeAccessContext,
  committeeId: string
): Promise<string> =>
  getCommitteeChatGroupId(
    getCommitteeAccess(context, committeeId).committee as unknown as CommitteeDoc
  );

// The roles that may read / write a committee's discussion. Keep in step with
// @checkCommitteeAccess on the read and write fields in discussions.ts
// (discussions-roles.test.ts checks the schema side).
export const DISCUSSION_READ_ROLES: CommitteeMemberRole[] = [
  CommitteeMemberRoles.COORDINATOR,
  CommitteeMemberRoles.MEMBER,
  CommitteeMemberRoles.OBSERVER,
];

export const DISCUSSION_WRITE_ROLES: CommitteeMemberRole[] = [
  CommitteeMemberRoles.COORDINATOR,
  CommitteeMemberRoles.MEMBER,
];

const getRoleCommitteeChatGroupId = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string,
  allowedRoles: CommitteeMemberRole[]
): Promise<string> => {
  const committee = await getMemberCommittee(user, committeeId);
  const role = committee ? getCommitteeRole(user, committee) : null;
  if (!committee || !role) {
    throw new GraphQLError('You are not a member of this committee.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  if (!allowedRoles.includes(role)) {
    throw new GraphQLError(
      'Your role in this committee does not allow this operation.',
      { extensions: { code: 'FORBIDDEN' } }
    );
  }
  return getCommitteeChatGroupId(committee as unknown as CommitteeDoc);
};

/**
 * The chat group, for the discussion's file download route, which is plain
 * REST and so cannot use the schema directive: the user must hold a role that
 * may read the discussion, and the committee must have Discussions enabled.
 */
export const getReaderCommitteeChatGroupId = (
  user: WorkspaceUser | null | undefined,
  committeeId: string
): Promise<string> =>
  getRoleCommitteeChatGroupId(user, committeeId, DISCUSSION_READ_ROLES);

/** As above, for the file upload route: only roles that may post messages. */
export const getWriterCommitteeChatGroupId = (
  user: WorkspaceUser | null | undefined,
  committeeId: string
): Promise<string> =>
  getRoleCommitteeChatGroupId(user, committeeId, DISCUSSION_WRITE_ROLES);

/** The ERP file route for a committee discussion's uploads. */
export const committeeDiscussionFileUrl =
  (committeeId: string) => (fileId: string, fileName: string) =>
    `/api/workspaces/committees/${committeeId}/discussions/files/${fileId}/${fileName}`;
