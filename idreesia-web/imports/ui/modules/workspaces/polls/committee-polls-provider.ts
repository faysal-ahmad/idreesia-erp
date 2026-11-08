import type { ApolloClient } from '@apollo/client';
import type {
  WorkspacePollActivityQuery,
  WorkspacePollFieldsFragment,
  WorkspacePollMembersQuery,
  WorkspacePollResultsQuery,
  WorkspacePollsInfoQuery,
  WorkspacePollsQuery,
  WorkspacePollVotersQuery,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PollsError,
  type Poll,
  type PollActivity,
  type PollAnswer,
  type PollDetails,
  type PollMember,
  type PollPage,
  type PollQuestionType,
  type PollResults,
  type PollsDataProvider,
  type PollsInfo,
  type PollsQuery,
  type PollStatus,
  type PollVoter,
} from '/imports/ui/modules/common/polls';

import {
  WORKSPACE_ADD_POLL_VOTERS,
  WORKSPACE_CANCEL_POLL,
  WORKSPACE_CAST_POLL_VOTE,
  WORKSPACE_CLOSE_POLL,
  WORKSPACE_CREATE_POLL,
  WORKSPACE_DELETE_POLL,
  WORKSPACE_OPEN_POLL,
  WORKSPACE_POLL_ACTIVITY,
  WORKSPACE_POLL_BY_ID,
  WORKSPACE_POLL_MEMBERS,
  WORKSPACE_POLL_RESULTS,
  WORKSPACE_POLL_VOTERS,
  WORKSPACE_POLLS,
  WORKSPACE_POLLS_INFO,
  WORKSPACE_REOPEN_POLL,
  WORKSPACE_UPDATE_POLL,
  WORKSPACE_WITHDRAW_POLL_VOTE,
} from './gql';

const notNull = <T>(value: T | null | undefined): value is T => value != null;

/** The server's message and error code, from an Apollo or network error. */
const toPollsError = (error: unknown): PollsError => {
  if (error instanceof PollsError) return error;
  const [graphQLError] =
    (
      error as {
        errors?: Array<{ message?: string; extensions?: { code?: unknown } }>;
      }
    )?.errors ?? [];
  if (graphQLError?.message) {
    const code = graphQLError.extensions?.code;
    return new PollsError(
      graphQLError.message,
      typeof code === 'string' ? code : null
    );
  }
  return new PollsError(
    error instanceof Error ? error.message : 'Something went wrong.'
  );
};

const mapPoll = (poll: WorkspacePollFieldsFragment): Poll => ({
  _id: poll._id!,
  title: poll.title ?? '',
  description: poll.description ?? null,
  status: (poll.status ?? 'draft') as PollStatus,
  anonymous: !!poll.anonymous,
  showResultsWhileOpen: !!poll.showResultsWhileOpen,
  closesAt: poll.closesAt ?? '0',
  openedAt: poll.openedAt ?? null,
  closedAt: poll.closedAt ?? null,
  closedByName: poll.closedByName ?? null,
  cancelledAt: poll.cancelledAt ?? null,
  cancelledByName: poll.cancelledByName ?? null,
  cancellationReason: poll.cancellationReason ?? null,
  questions: (poll.questions ?? []).filter(notNull).map(question => ({
    _id: question._id!,
    text: question.text ?? '',
    description: question.description ?? null,
    type: (question.type ?? 'single') as PollQuestionType,
    required: question.required ?? true,
    minChoices: question.minChoices ?? null,
    maxChoices: question.maxChoices ?? null,
    options: (question.options ?? []).filter(notNull).map(option => ({
      _id: option._id!,
      text: option.text ?? '',
    })),
  })),
  eligibleVoterIds: poll.eligibleVoterIds
    ? poll.eligibleVoterIds.filter(notNull)
    : null,
  eligibleCount: poll.eligibleCount ?? null,
  voteCount: poll.voteCount ?? 0,
  isEligible: !!poll.isEligible,
  hasVoted: !!poll.hasVoted,
  myAnswers: poll.myAnswers
    ? poll.myAnswers.filter(notNull).map(answer => ({
        questionId: answer.questionId ?? '',
        optionIds: (answer.optionIds ?? []).filter(notNull),
      }))
    : null,
  canSeeResults: !!poll.canSeeResults,
  createdAt: poll.createdAt ?? null,
  createdByName: poll.createdByName ?? null,
  updatedAt: poll.updatedAt ?? null,
  updatedByName: poll.updatedByName ?? null,
});

const mapVoters = (
  voters: Array<{ voterId?: string | null; name?: string | null } | null> | null | undefined
) =>
  voters
    ? voters
        .filter(notNull)
        .map(voter => ({ voterId: voter.voterId ?? '', name: voter.name ?? null }))
    : null;

const parseDetails = (details: string | null | undefined) => {
  if (!details) return {};
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return {};
  }
};

/** Poll data for a committee in Workspaces, over GraphQL. */
export default class CommitteePollsProvider implements PollsDataProvider {
  constructor(
    private readonly client: ApolloClient,
    private readonly committeeId: string
  ) {}

  private async run<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw toPollsError(error);
    }
  }

  private query<TData>(
    query: Parameters<ApolloClient['query']>[0]['query'],
    variables: Record<string, unknown> = {}
  ): Promise<TData> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query,
        variables: { committeeId: this.committeeId, ...variables },
        fetchPolicy: 'network-only',
      });
      return data as TData;
    });
  }

  private mutate<TData>(
    mutation: Parameters<ApolloClient['mutate']>[0]['mutation'],
    variables: Record<string, unknown>
  ): Promise<TData> {
    return this.run(async () => {
      const { data } = await this.client.mutate({
        mutation,
        variables: { committeeId: this.committeeId, ...variables },
      });
      return data as TData;
    });
  }

  /** Runs a mutation that returns the updated poll under `field`. */
  private async mutatePoll(
    mutation: Parameters<ApolloClient['mutate']>[0]['mutation'],
    field: string,
    variables: Record<string, unknown>
  ): Promise<Poll> {
    const data = await this.mutate<
      Record<string, WorkspacePollFieldsFragment | null>
    >(mutation, variables);
    const poll = data?.[field];
    if (!poll?._id) throw new PollsError('The poll was not returned.');
    return mapPoll(poll);
  }

  async getInfo(): Promise<PollsInfo> {
    const data = await this.query<WorkspacePollsInfoQuery>(WORKSPACE_POLLS_INFO);
    return {
      canManage: !!data?.workspacePollsInfo?.canManage,
      myVoterId: data?.workspacePollsInfo?.myVoterId ?? null,
    };
  }

  async loadMembers(): Promise<PollMember[]> {
    const data = await this.query<WorkspacePollMembersQuery>(
      WORKSPACE_POLL_MEMBERS
    );
    return (data?.workspacePollMembers ?? [])
      .filter(notNull)
      .filter(member => !!member.voterId)
      .map(member => ({
        voterId: member.voterId!,
        name: member.name ?? null,
        isCoordinator: !!member.isCoordinator,
      }));
  }

  async loadPolls({ view, text, pageIndex, pageSize }: PollsQuery): Promise<PollPage> {
    const data = await this.query<WorkspacePollsQuery>(WORKSPACE_POLLS, {
      view,
      text: text ?? null,
      pageIndex,
      pageSize,
    });
    return {
      polls: (data?.workspacePolls?.data ?? [])
        .filter(notNull)
        .filter(poll => !!poll._id)
        .map(mapPoll),
      totalResults: data?.workspacePolls?.totalResults ?? 0,
    };
  }

  async loadPoll(pollId: string): Promise<Poll> {
    const data = await this.query<{
      workspacePollById?: WorkspacePollFieldsFragment | null;
    }>(WORKSPACE_POLL_BY_ID, { pollId });
    const poll = data?.workspacePollById;
    if (!poll?._id) throw new PollsError('Poll not found', 'NOT_FOUND');
    return mapPoll(poll);
  }

  async loadResults(pollId: string): Promise<PollResults> {
    const data = await this.query<WorkspacePollResultsQuery>(
      WORKSPACE_POLL_RESULTS,
      { pollId }
    );
    const results = data?.workspacePollResults;
    if (!results) throw new PollsError('No results');
    return {
      pollId: results.pollId ?? pollId,
      status: (results.status ?? 'closed') as PollStatus,
      anonymous: !!results.anonymous,
      closedAt: results.closedAt ?? null,
      totalVoters: results.totalVoters ?? 0,
      eligibleCount: results.eligibleCount ?? null,
      turnout: results.turnout ?? null,
      nonVoters: mapVoters(results.nonVoters),
      questions: (results.questions ?? []).filter(notNull).map(question => ({
        questionId: question.questionId ?? '',
        text: question.text ?? '',
        type: (question.type ?? 'single') as PollQuestionType,
        answeredCount: question.answeredCount ?? 0,
        options: (question.options ?? []).filter(notNull).map(option => ({
          optionId: option.optionId ?? '',
          text: option.text ?? '',
          count: option.count ?? 0,
          percentage: option.percentage ?? 0,
          voters: mapVoters(option.voters),
        })),
      })),
    };
  }

  async loadVoters(pollId: string): Promise<PollVoter[]> {
    const data = await this.query<WorkspacePollVotersQuery>(
      WORKSPACE_POLL_VOTERS,
      { pollId }
    );
    return (data?.workspacePollVoters ?? []).filter(notNull).map(voter => ({
      voterId: voter.voterId ?? '',
      name: voter.name ?? null,
      hasVoted: voter.hasVoted ?? null,
    }));
  }

  async loadActivity(pollId: string, before?: string): Promise<PollActivity[]> {
    const data = await this.query<WorkspacePollActivityQuery>(
      WORKSPACE_POLL_ACTIVITY,
      { pollId, before: before ?? null, limit: 50 }
    );
    return (data?.workspacePollActivity ?? []).filter(notNull).map(entry => ({
      _id: entry._id ?? '',
      action: entry.action ?? '',
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ?? null,
      userName: entry.userName ?? null,
      at: entry.at ?? null,
      details: parseDetails(entry.details),
    }));
  }

  createPoll(details: PollDetails): Promise<Poll> {
    return this.mutatePoll(WORKSPACE_CREATE_POLL, 'workspaceCreatePoll', {
      input: details,
    });
  }

  updatePoll(pollId: string, details: PollDetails): Promise<Poll> {
    return this.mutatePoll(WORKSPACE_UPDATE_POLL, 'workspaceUpdatePoll', {
      pollId,
      input: details,
    });
  }

  addVoters(pollId: string, voterIds: string[]): Promise<Poll> {
    return this.mutatePoll(WORKSPACE_ADD_POLL_VOTERS, 'workspaceAddPollVoters', {
      pollId,
      voterIds,
    });
  }

  openPoll(pollId: string, closesAt?: string): Promise<Poll> {
    return this.mutatePoll(WORKSPACE_OPEN_POLL, 'workspaceOpenPoll', {
      pollId,
      closesAt: closesAt ?? null,
    });
  }

  closePoll(pollId: string): Promise<Poll> {
    return this.mutatePoll(WORKSPACE_CLOSE_POLL, 'workspaceClosePoll', {
      pollId,
    });
  }

  reopenPoll(pollId: string, closesAt: string): Promise<Poll> {
    return this.mutatePoll(WORKSPACE_REOPEN_POLL, 'workspaceReopenPoll', {
      pollId,
      closesAt,
    });
  }

  cancelPoll(pollId: string, reason?: string): Promise<Poll> {
    return this.mutatePoll(WORKSPACE_CANCEL_POLL, 'workspaceCancelPoll', {
      pollId,
      reason: reason ?? null,
    });
  }

  async deletePoll(pollId: string): Promise<void> {
    await this.mutate(WORKSPACE_DELETE_POLL, { pollId });
  }

  vote(pollId: string, answers: PollAnswer[]): Promise<Poll> {
    return this.mutatePoll(WORKSPACE_CAST_POLL_VOTE, 'workspaceCastPollVote', {
      pollId,
      answers,
    });
  }

  withdrawVote(pollId: string): Promise<Poll> {
    return this.mutatePoll(
      WORKSPACE_WITHDRAW_POLL_VOTE,
      'workspaceWithdrawPollVote',
      { pollId }
    );
  }
}
