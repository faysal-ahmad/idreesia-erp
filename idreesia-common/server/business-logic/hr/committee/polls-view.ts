import {
  PollStatus,
  type PollStatusValue,
} from 'meteor/idreesia-common/constants/polls';
import {
  canSeeResults,
  getPoll,
  getPollResults,
  getVote,
  listBallots,
  listPolls,
  listPollsActivity,
  type PollResults,
} from 'meteor/idreesia-common/server/business-logic/polls';
import { People } from 'meteor/idreesia-common/server/collections/common';
import type {
  PollBallotDocument,
  PollDocument,
  PollsActivityDocument,
} from 'meteor/idreesia-common/server/collections/polls';

import { getUserNames } from './documents-library';
import type { ViewContext } from './meetings-view';
import type { CommitteeDoc } from './types';

/*
 * A committee's polls, as the Workspaces feature shows them: the polls
 * module records with member and user names instead of ids, and timestamps
 * as strings. Voters are committee members (karkun ids). Callers check that
 * the user may use the committee's polls (and that the ids belong to its
 * workspace) first. Anonymous polls never get voter names.
 */

type Names = Map<string, string>;

const timestamp = (date?: Date) => (date ? String(date.getTime()) : null);
const nameOf = (names: Names, id?: string | null) =>
  (id && names.get(id)) || null;

/** Names of karkuns (committee members), by their person id. */
async function getPersonNames(
  personIds: Array<string | null | undefined>
): Promise<Names> {
  const ids = [...new Set(personIds.filter((id): id is string => !!id))];
  if (!ids.length) return new Map();
  const people = (await People.find(
    { _id: { $in: ids } },
    { fields: { _id: 1, 'sharedData.name': 1 } }
  ).fetchAsync()) as Array<{ _id: string; sharedData?: { name?: string } }>;
  return new Map(
    people
      .filter(person => person.sharedData?.name)
      .map(person => [person._id, person.sharedData!.name!])
  );
}

const byName = <T extends { name: string | null }>(a: T, b: T) =>
  (a.name ?? '').localeCompare(b.name ?? '');

// ---------------------------------------------------------------------------
// Info and members
// ---------------------------------------------------------------------------

export function getCommitteePollsInfo(context: ViewContext) {
  return {
    canManage: context.isCoordinator,
    myVoterId: context.personId,
  };
}

/** The committee's members, who can be made eligible to vote, by name. */
export async function getCommitteePollMembers(committee: CommitteeDoc) {
  const members = committee.members ?? [];
  const names = await getPersonNames(members.map(({ karkunId }) => karkunId));
  return members
    .map(member => ({
      voterId: member.karkunId,
      name: names.get(member.karkunId) ?? null,
      isCoordinator: !!member.isCoordinator,
    }))
    .sort(byName);
}

/** The current members' voter ids: the default eligible list. */
export const getCommitteeVoterIds = (committee: CommitteeDoc) =>
  (committee.members ?? []).map(({ karkunId }) => karkunId);

// ---------------------------------------------------------------------------
// Polls
// ---------------------------------------------------------------------------

const pollUserIds = (poll: PollDocument) => [
  poll.createdBy,
  poll.updatedBy,
  poll.openedBy,
  poll.closedBy,
  poll.cancelledBy,
];

function toPoll(
  poll: PollDocument,
  myBallot: PollBallotDocument | null,
  users: Names,
  context: ViewContext
) {
  const eligible = poll.eligibleVoterIds ?? null;
  const isEligible =
    !!context.personId && (!eligible || eligible.includes(context.personId));
  return {
    _id: poll._id,
    title: poll.title,
    description: poll.description ?? null,
    status: poll.status,
    anonymous: poll.anonymous,
    showResultsWhileOpen: poll.showResultsWhileOpen,
    closesAt: timestamp(poll.closesAt),
    openedAt: timestamp(poll.openedAt),
    closedAt: timestamp(poll.closedAt),
    closedByName: nameOf(users, poll.closedBy),
    cancelledAt: timestamp(poll.cancelledAt),
    cancelledByName: nameOf(users, poll.cancelledBy),
    cancellationReason: poll.cancellationReason ?? null,
    questions: poll.questions.map(question => ({
      _id: question._id,
      text: question.text,
      description: question.description ?? null,
      type: question.type,
      required: question.required,
      minChoices: question.minChoices ?? null,
      maxChoices: question.maxChoices ?? null,
      options: question.options.map(option => ({
        _id: option._id,
        text: option.text,
      })),
    })),
    eligibleVoterIds: eligible,
    eligibleCount: eligible?.length ?? null,
    voteCount: poll.voteCount,
    isEligible,
    hasVoted: !!myBallot,
    myAnswers: myBallot?.answers ?? null,
    canSeeResults: canSeeResults(poll),
    createdAt: timestamp(poll.createdAt),
    createdByName: nameOf(users, poll.createdBy),
    updatedAt: timestamp(poll.updatedAt),
    updatedByName: nameOf(users, poll.updatedBy),
  };
}

async function mapPolls(polls: PollDocument[], context: ViewContext) {
  const [users, ballots] = await Promise.all([
    getUserNames(polls.flatMap(pollUserIds)),
    Promise.all(
      polls.map(poll =>
        context.personId
          ? getVote(poll._id, context.personId, context.userId)
          : null
      )
    ),
  ]);
  return polls.map((poll, index) =>
    toPoll(poll, ballots[index], users, context)
  );
}

export async function toCommitteePoll(poll: PollDocument, context: ViewContext) {
  return (await mapPolls([poll], context))[0];
}

export async function getCommitteePoll(pollId: string, context: ViewContext) {
  return toCommitteePoll(await getPoll(pollId, context.userId), context);
}

/** Which polls a list shows. */
export type PollsView = 'open' | 'closed' | 'drafts' | 'all';

export interface CommitteePollsOptions {
  view?: PollsView | null;
  text?: string | null;
  pageIndex?: number | null;
  pageSize?: number | null;
}

const toPage = (pageIndex?: number | null, pageSize?: number | null) => {
  const limit = pageSize ?? 20;
  return { skip: (pageIndex ?? 0) * limit, limit };
};

/**
 * - open: open polls, closing soonest first
 * - closed: closed polls, latest first
 * - drafts: drafts, newest first (coordinators only)
 * - all: everything a user can see, newest first. Drafts are only shown to
 *   coordinators.
 */
export async function listCommitteePolls(
  workspaceId: string,
  context: ViewContext,
  { view, text, pageIndex, pageSize }: CommitteePollsOptions
) {
  let status: PollStatusValue[];
  let sortBy: 'closesAt' | 'createdAt' = 'createdAt';
  let sortOrder: 'asc' | 'desc' = 'desc';

  switch (view ?? 'open') {
    case 'open':
      status = [PollStatus.OPEN];
      sortBy = 'closesAt';
      sortOrder = 'asc';
      break;
    case 'closed':
      status = [PollStatus.CLOSED];
      sortBy = 'closesAt';
      break;
    case 'drafts':
      if (!context.isCoordinator) return { data: [], totalResults: 0 };
      status = [PollStatus.DRAFT];
      break;
    default:
      status = Object.values(PollStatus).filter(
        value => context.isCoordinator || value !== PollStatus.DRAFT
      );
      break;
  }

  const page = await listPolls(workspaceId, context.userId, {
    status,
    sortBy,
    sortOrder,
    text: text?.trim() || undefined,
    ...toPage(pageIndex, pageSize),
  });
  return {
    data: await mapPolls(page.data, context),
    totalResults: page.totalResults,
  };
}

// ---------------------------------------------------------------------------
// Results and voters
// ---------------------------------------------------------------------------

/** The results, with voter names for named polls. */
export async function getCommitteePollResults(
  pollId: string,
  context: ViewContext
) {
  const results: PollResults = await getPollResults(pollId, context.userId);
  const people = results.anonymous
    ? new Map<string, string>()
    : await getPersonNames([
        ...(results.nonVoterIds ?? []),
        ...results.questions.flatMap(question =>
          question.options.flatMap(option => option.voterIds ?? [])
        ),
      ]);
  const toVoters = (ids?: string[]) =>
    ids
      ? ids
          .map(voterId => ({ voterId, name: nameOf(people, voterId) }))
          .sort(byName)
      : null;

  return {
    pollId: results.pollId,
    status: results.status,
    anonymous: results.anonymous,
    closedAt: timestamp(results.closedAt),
    totalVoters: results.totalVoters,
    eligibleCount: results.eligibleCount ?? null,
    turnout: results.turnout ?? null,
    nonVoters: toVoters(results.nonVoterIds),
    questions: results.questions.map(question => ({
      questionId: question.questionId,
      text: question.text,
      type: question.type,
      answeredCount: question.answeredCount,
      options: question.options.map(option => ({
        optionId: option.optionId,
        text: option.text,
        count: option.count,
        percentage: option.percentage,
        voters: toVoters(option.voterIds),
      })),
    })),
  };
}

/**
 * The eligible voters, by name. For named polls, each also says whether
 * they have voted; anonymous polls leave that unset.
 */
export async function getCommitteePollVoters(
  poll: PollDocument,
  committee: CommitteeDoc,
  context: ViewContext
) {
  const voterIds = poll.eligibleVoterIds ?? getCommitteeVoterIds(committee);
  let voted: Set<string> | null = null;
  if (!poll.anonymous) {
    voted = new Set();
    for (let skip = 0; ; skip += 200) {
      const page = await listBallots(poll._id, context.userId, {
        skip,
        limit: 200,
      });
      page.data.forEach(({ voterId }) => voted!.add(voterId));
      if (skip + page.data.length >= page.totalResults || !page.data.length) {
        break;
      }
    }
  }
  const names = await getPersonNames(voterIds);
  return voterIds
    .map(voterId => ({
      voterId,
      name: nameOf(names, voterId),
      hasVoted: voted ? voted.has(voterId) : null,
    }))
    .sort(byName);
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export async function getCommitteePollActivity(
  workspaceId: string,
  context: ViewContext,
  {
    pollId,
    before,
    limit,
  }: { pollId?: string | null; before?: string | null; limit?: number | null }
) {
  const entries: PollsActivityDocument[] = await listPollsActivity(
    workspaceId,
    context.userId,
    {
      pollId: pollId || undefined,
      before: before ? new Date(Number(before)) : undefined,
      limit: limit ?? 50,
    }
  );
  const users = await getUserNames(entries.map(({ userId }) => userId));
  return entries.map(entry => ({
    _id: entry._id,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    pollId: entry.pollId ?? null,
    userName: nameOf(users, entry.userId),
    at: timestamp(entry.at),
    details: entry.details ? JSON.stringify(entry.details) : null,
  }));
}
