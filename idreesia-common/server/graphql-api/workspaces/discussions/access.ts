import { GraphQLError } from 'graphql';

import {
  CommitteeMemberRoles,
  type CommitteeMemberRole,
} from 'meteor/idreesia-common/constants/organization';
import {
  getCommitteeChatGroupId,
  type CommitteeDoc,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

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

// The roles that may read a committee's discussion. Keep in step with
// @checkCommitteeAccess on the read fields in discussions.ts.
const DISCUSSION_READ_ROLES: CommitteeMemberRole[] = [
  CommitteeMemberRoles.COORDINATOR,
  CommitteeMemberRoles.MEMBER,
  CommitteeMemberRoles.OBSERVER,
];

/**
 * The chat group, for the discussion's file route, which is plain REST and so
 * cannot use the schema directive: the user must hold a role that may read
 * the discussion, and the committee must have Discussions enabled.
 */
export const getReaderCommitteeChatGroupId = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string
): Promise<string> => {
  const committee = await getMemberCommittee(user, committeeId);
  const role = committee ? getCommitteeRole(user, committee) : null;
  if (!committee || !role) {
    throw new GraphQLError('You are not a member of this committee.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  if (!DISCUSSION_READ_ROLES.includes(role)) {
    throw new GraphQLError(
      'Your role in this committee does not allow this operation.',
      { extensions: { code: 'FORBIDDEN' } }
    );
  }
  return getCommitteeChatGroupId(committee as unknown as CommitteeDoc);
};

/** The ERP file route for a committee discussion's uploads. */
export const committeeDiscussionFileUrl =
  (committeeId: string) => (fileId: string, fileName: string) =>
    `/api/workspaces/committees/${committeeId}/discussions/files/${fileId}/${fileName}`;
