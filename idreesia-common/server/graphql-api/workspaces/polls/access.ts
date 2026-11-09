import { GraphQLError } from 'graphql';

import { getPoll } from 'meteor/idreesia-common/server/business-logic/polls';
import { PollStatus } from 'meteor/idreesia-common/constants/polls';
import {
  areCommitteeMembers,
  getCommitteePollsWorkspaceId,
  type CommitteeDoc,
  type ViewContext,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  getMemberCommittee,
  isCommitteeCoordinator,
  type WorkspaceUser,
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
 * Permission check for a committee's polls: the user must be a member of
 * the committee (erp-admin counts as one), and the committee must have
 * Polls enabled. With `coordinator`, only its coordinators pass - for
 * creating and managing polls.
 */
export const getPollsAccess = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string,
  { coordinator = false }: { coordinator?: boolean } = {}
): Promise<PollsAccess> => {
  const committee = await getMemberCommittee(user, committeeId);
  if (!committee || !user?._id) {
    throw forbidden('You are not a member of this committee.');
  }
  const workspaceId = getCommitteePollsWorkspaceId(
    committee as unknown as CommitteeDoc
  );
  const isCoordinator = isCommitteeCoordinator(user, committee);
  if (coordinator && !isCoordinator) {
    throw forbidden('Only coordinators of this committee can do this.');
  }
  return {
    workspaceId,
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
