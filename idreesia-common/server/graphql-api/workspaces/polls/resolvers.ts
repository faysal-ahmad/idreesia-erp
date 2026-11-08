import {
  addEligibleVoters,
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
  getCommitteePollMembers,
  getCommitteePollResults,
  getCommitteePollsInfo,
  getCommitteePollVoters,
  getCommitteeVoterIds,
  listCommitteePolls,
  parseTimestamp,
  toCommitteePoll,
  updateCommitteePoll,
  type CommitteePollInput,
  type PollsView,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  assertMembers,
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

/** Checks a coordinator's access and that the poll is the committee's. */
const managedPoll = async (
  user: unknown,
  committeeId: string,
  pollId: string
) => {
  const access = await getPollsAccess(user as any, committeeId, {
    coordinator: true,
  });
  const poll = await assertPollInWorkspace(access, pollId);
  return { access, poll };
};

/** Eligible voters in the input must be members of the committee. */
const checkInput = (access: PollsAccess, input: CommitteePollInput) => {
  const voterIds = (input.eligibleVoterIds ?? []).filter(Boolean);
  assertMembers(access, voterIds);
  return { ...input, eligibleVoterIds: voterIds };
};

// Each resolver only checks access - committee membership + Polls enabled,
// coordinators for managing polls, members voting only as themselves, ids
// belonging to the committee's workspace, voters being committee members.
// The polls module and the committee polls logic do the work, and the
// module enforces the poll status rules, eligibility and anonymity.
const resolvers: ResolverMap = {
  Query: {
    workspacePollsInfo: async (obj, { committeeId }, { user }) => {
      const access = await getPollsAccess(user, committeeId);
      return getCommitteePollsInfo(access);
    },

    workspacePollMembers: async (obj, { committeeId }, { user }) => {
      const access = await getPollsAccess(user, committeeId);
      return getCommitteePollMembers(access.committee);
    },

    workspacePolls: async (
      obj,
      { committeeId, view: pollsView, text, pageIndex, pageSize },
      { user }
    ) => {
      const access = await getPollsAccess(user, committeeId);
      return listCommitteePolls(access.workspaceId, access, {
        view: pollsView as PollsView | null,
        text,
        pageIndex,
        pageSize,
      });
    },

    workspacePollById: async (obj, { committeeId, pollId }, { user }) => {
      const access = await getPollsAccess(user, committeeId);
      await assertPollInWorkspace(access, pollId);
      return getCommitteePoll(pollId, access);
    },

    workspacePollResults: async (obj, { committeeId, pollId }, { user }) => {
      const access = await getPollsAccess(user, committeeId);
      await assertPollInWorkspace(access, pollId);
      return getCommitteePollResults(pollId, access);
    },

    workspacePollVoters: async (obj, { committeeId, pollId }, { user }) => {
      const { access, poll } = await managedPoll(user, committeeId, pollId);
      return getCommitteePollVoters(poll, access.committee, access);
    },

    workspacePollActivity: async (
      obj,
      { committeeId, pollId, before, limit },
      { user }
    ) => {
      const access = await getPollsAccess(user, committeeId, {
        coordinator: true,
      });
      if (pollId) await assertPollInWorkspace(access, pollId);
      return getCommitteePollActivity(access.workspaceId, access, {
        pollId,
        before,
        limit,
      });
    },
  },

  Mutation: {
    workspaceCreatePoll: async (obj, { committeeId, input }, { user }) => {
      const access = await getPollsAccess(user, committeeId, {
        coordinator: true,
      });
      const poll = await createCommitteePoll(
        access.workspaceId,
        checkInput(access, input),
        getCommitteeVoterIds(access.committee),
        access.userId
      );
      return view(access, poll);
    },

    workspaceUpdatePoll: async (
      obj,
      { committeeId, pollId, input },
      { user }
    ) => {
      const { access, poll } = await managedPoll(user, committeeId, pollId);
      return view(
        access,
        await updateCommitteePoll(
          poll,
          checkInput(access, input),
          getCommitteeVoterIds(access.committee),
          access.userId
        )
      );
    },

    workspaceAddPollVoters: async (
      obj,
      { committeeId, pollId, voterIds },
      { user }
    ) => {
      const { access } = await managedPoll(user, committeeId, pollId);
      const ids = (voterIds as string[]).filter(Boolean);
      assertMembers(access, ids);
      return view(access, await addEligibleVoters(pollId, ids, access.userId));
    },

    workspaceOpenPoll: async (
      obj,
      { committeeId, pollId, closesAt },
      { user }
    ) => {
      const { access } = await managedPoll(user, committeeId, pollId);
      return view(
        access,
        await openPoll(pollId, access.userId, {
          closesAt: parseTimestamp(closesAt),
        })
      );
    },

    workspaceClosePoll: async (obj, { committeeId, pollId }, { user }) => {
      const { access } = await managedPoll(user, committeeId, pollId);
      return view(access, await closePoll(pollId, access.userId));
    },

    workspaceReopenPoll: async (
      obj,
      { committeeId, pollId, closesAt },
      { user }
    ) => {
      const { access } = await managedPoll(user, committeeId, pollId);
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
      { user }
    ) => {
      const { access } = await managedPoll(user, committeeId, pollId);
      return view(
        access,
        await cancelPoll(pollId, access.userId, {
          reason: reason ?? undefined,
        })
      );
    },

    workspaceDeletePoll: async (obj, { committeeId, pollId }, { user }) => {
      const { access } = await managedPoll(user, committeeId, pollId);
      await deletePoll(pollId, access.userId);
      return true;
    },

    workspaceCastPollVote: async (
      obj,
      { committeeId, pollId, answers },
      { user }
    ) => {
      const access = await getPollsAccess(user, committeeId);
      const voterId = requireVoterId(access);
      await assertPollInWorkspace(access, pollId);
      await castVote(pollId, voterId, answers, access.userId);
      return getCommitteePoll(pollId, access);
    },

    workspaceWithdrawPollVote: async (
      obj,
      { committeeId, pollId },
      { user }
    ) => {
      const access = await getPollsAccess(user, committeeId);
      const voterId = requireVoterId(access);
      await assertPollInWorkspace(access, pollId);
      await withdrawVote(pollId, voterId, access.userId);
      return getCommitteePoll(pollId, access);
    },
  },
};

export default resolvers;
