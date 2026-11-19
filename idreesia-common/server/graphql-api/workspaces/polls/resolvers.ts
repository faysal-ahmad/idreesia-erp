import {
  cancelPoll,
  castVote,
  closePoll,
  deletePoll,
  openPoll,
  reopenPoll,
  withdrawVote,
} from 'meteor/idreesia-common/server/business-logic/polls';
import {
  createCommitteePoll,
  getCommitteePoll,
  getCommitteePollActivity,
  getCommitteePollResults,
  getCommitteePollsInfo,
  listCommitteePolls,
  parseTimestamp,
  toCommitteePoll,
  updateCommitteePoll,
  type PollsView,
} from 'meteor/idreesia-common/server/business-logic/admin/committee';

import {
  assertPollInWorkspace,
  getPollsAccess,
  requireVoterId,
  type PollsAccess,
} from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

/** The poll as the UI shows it, after a change. */
const view = (
  access: PollsAccess,
  poll: Parameters<typeof toCommitteePoll>[0]
) => toCommitteePoll(poll, access);

/** A poll of the committee, for a coordinator. */
const managedPoll = async (
  context: unknown,
  committeeId: string,
  pollId: string
) => {
  const access = getPollsAccess(context as any, committeeId);
  const poll = await assertPollInWorkspace(access, pollId);
  return { access, poll };
};

// Who may call each field (committee role) is declared in the schema with
// @checkCommitteeAccess. The resolvers only check what the role cannot tell:
// Polls enabled on the committee, members voting only as themselves, ids
// belonging to the committee's workspace, drafts visible to coordinators.
// The polls module and the committee polls logic do the work, and the
// module enforces the poll status rules and anonymity.
const resolvers: ResolverMap = {
  Query: {
    workspacePollsInfo: async (obj, { committeeId }, context) => {
      const access = getPollsAccess(context, committeeId);
      return getCommitteePollsInfo(access);
    },

    workspacePolls: async (
      obj,
      { committeeId, view: pollsView, text, pageIndex, pageSize },
      context
    ) => {
      const access = getPollsAccess(context, committeeId);
      return listCommitteePolls(access.workspaceId, access, {
        view: pollsView as PollsView | null,
        text,
        pageIndex,
        pageSize,
      });
    },

    workspacePollById: async (obj, { committeeId, pollId }, context) => {
      const access = getPollsAccess(context, committeeId);
      await assertPollInWorkspace(access, pollId);
      return getCommitteePoll(pollId, access);
    },

    workspacePollResults: async (obj, { committeeId, pollId }, context) => {
      const access = getPollsAccess(context, committeeId);
      await assertPollInWorkspace(access, pollId);
      return getCommitteePollResults(pollId, access);
    },

    workspacePollActivity: async (
      obj,
      { committeeId, pollId, before, limit },
      context
    ) => {
      const access = getPollsAccess(context, committeeId);
      if (pollId) await assertPollInWorkspace(access, pollId);
      return getCommitteePollActivity(access.workspaceId, access, {
        pollId,
        before,
        limit,
      });
    },
  },

  Mutation: {
    workspaceCreatePoll: async (obj, { committeeId, input }, context) => {
      const access = getPollsAccess(context, committeeId);
      const poll = await createCommitteePoll(
        access.workspaceId,
        input,
        access.userId
      );
      return view(access, poll);
    },

    workspaceUpdatePoll: async (
      obj,
      { committeeId, pollId, input },
      context
    ) => {
      const { access, poll } = await managedPoll(context, committeeId, pollId);
      return view(
        access,
        await updateCommitteePoll(
          poll,
          input,
          access.userId
        )
      );
    },

    workspaceOpenPoll: async (
      obj,
      { committeeId, pollId, closesAt },
      context
    ) => {
      const { access } = await managedPoll(context, committeeId, pollId);
      return view(
        access,
        await openPoll(pollId, access.userId, {
          closesAt: parseTimestamp(closesAt),
        })
      );
    },

    workspaceClosePoll: async (obj, { committeeId, pollId }, context) => {
      const { access } = await managedPoll(context, committeeId, pollId);
      return view(access, await closePoll(pollId, access.userId));
    },

    workspaceReopenPoll: async (
      obj,
      { committeeId, pollId, closesAt },
      context
    ) => {
      const { access } = await managedPoll(context, committeeId, pollId);
      return view(
        access,
        await reopenPoll(
          pollId,
          { closesAt: parseTimestamp(closesAt)! },
          access.userId
        )
      );
    },

    workspaceCancelPoll: async (
      obj,
      { committeeId, pollId, reason },
      context
    ) => {
      const { access } = await managedPoll(context, committeeId, pollId);
      return view(
        access,
        await cancelPoll(pollId, access.userId, {
          reason: reason ?? undefined,
        })
      );
    },

    workspaceDeletePoll: async (obj, { committeeId, pollId }, context) => {
      const { access } = await managedPoll(context, committeeId, pollId);
      await deletePoll(pollId, access.userId);
      return true;
    },

    workspaceCastPollVote: async (
      obj,
      { committeeId, pollId, answers },
      context
    ) => {
      const access = getPollsAccess(context, committeeId);
      const voterId = requireVoterId(access);
      await assertPollInWorkspace(access, pollId);
      await castVote(pollId, voterId, answers, access.userId);
      return getCommitteePoll(pollId, access);
    },

    workspaceWithdrawPollVote: async (
      obj,
      { committeeId, pollId },
      context
    ) => {
      const access = getPollsAccess(context, committeeId);
      const voterId = requireVoterId(access);
      await assertPollInWorkspace(access, pollId);
      await withdrawVote(pollId, voterId, access.userId);
      return getCommitteePoll(pollId, access);
    },
  },
};

export default resolvers;
