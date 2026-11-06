import { GraphQLError } from 'graphql';

import {
  getCommitteeChatGroupId,
  type CommitteeDoc,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import { getMemberCommittee, type WorkspaceUser } from '../committee/access';

/**
 * Permission check for a committee's discussions: the user must be a member
 * of the committee (erp-admin counts as one), and the committee must have
 * Discussions enabled. Returns the chat group to hand to the discussions
 * business logic. Shared by the GraphQL resolvers and the file routes.
 */
export const getMemberCommitteeChatGroupId = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string
): Promise<string> => {
  const committee = await getMemberCommittee(user, committeeId);
  if (!committee) {
    throw new GraphQLError('You are not a member of this committee.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return getCommitteeChatGroupId(committee as unknown as CommitteeDoc);
};

/** The ERP file route for a committee discussion's uploads. */
export const committeeDiscussionFileUrl =
  (committeeId: string) => (fileId: string, fileName: string) =>
    `/api/workspaces/committees/${committeeId}/discussions/files/${fileId}/${fileName}`;
