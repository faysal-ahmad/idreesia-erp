import { GraphQLError } from 'graphql';

import { getPoll } from 'meteor/idreesia-common/server/business-logic/polls';
import { PollStatus } from 'meteor/idreesia-common/constants/polls';
import {
  areCommitteeMembers,
  getCommitteePollsWorkspaceId,
  type CommitteeDoc,
  type ViewContext,
} from 'meteor/idreesia-common/server/business-logic/admin/committee';

import {
  getCommitteeAccess,
  type CommitteeAccessContext,
} from '../committee/access';

export interface PollsAccess extends ViewContext {
  /** The committee's polls workspace. */
  workspaceId: string;
  committee: CommitteeDoc;
}

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

const notFound = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });

/**
 * What a polls resolver works with, built from what `@checkCommitteeAccess`
 * found: who may call the field is decided by the directive in the schema.
 * Here the committee must also have Polls enabled.
 */
export const getPollsAccess = (
  context: CommitteeAccessContext,
  committeeId: string
): PollsAccess => {
  const { committee, isCoordinator } = getCommitteeAccess(
    context,
    committeeId
  );
  const { user } = context;
  if (!user?._id) {
    throw forbidden('You are not a member of this committee.');
  }
  return {
    workspaceId: getCommitteePollsWorkspaceId(
      committee as unknown as CommitteeDoc
    ),
    committee: committee as unknown as CommitteeDoc,
    userId: user._id,
    personId: user.personId ?? null,
    isCoordinator,
  };
};

/**
 * The polls module takes poll ids on their own, so each id from the client
 * is checked to belong to the committee's workspace before it is acted on.
 * Drafts are only visible to coordinators.
 */
export const assertPollInWorkspace = async (
  access: PollsAccess,
  pollId: string
) => {
  const poll = await getPoll(pollId, access.userId);
  if (
    poll.workspaceId !== access.workspaceId ||
    (poll.status === PollStatus.DRAFT && !access.isCoordinator)
  ) {
    throw notFound('Poll not found');
  }
  return poll;
};

/** The logged-in user's voter id; they must be a member of the committee. */
export const requireVoterId = (access: PollsAccess): string => {
  if (
    !access.personId ||
    !areCommitteeMembers(access.committee, [access.personId])
  ) {
    throw forbidden('Only members of this committee can vote.');
  }
  return access.personId;
};
