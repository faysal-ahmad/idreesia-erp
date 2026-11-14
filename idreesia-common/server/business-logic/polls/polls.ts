import {
  PollsAction,
  PollsEntityType,
  PollStatus,
  type PollStatusValue,
} from 'meteor/idreesia-common/constants/polls';
import {
  PollBallots,
  Polls,
  type PollDocument,
  type PollsMetadata,
} from 'meteor/idreesia-common/server/collections/polls';

import { logActivity } from './activity';
import { pollsError } from './errors';
import {
  DRAFT_ONLY,
  EDITABLE_STATUSES,
  liveWorkspaceSelector,
  METADATA_KEY_PATTERN,
  normalizeOpaqueId,
  normalizePage,
  normalizeTags,
  normalizeText,
  normalizeTitle,
  OPEN_ONLY,
  requireFuture,
  requireOneOf,
  requirePoll,
  requireUserId,
  requireWorkspace,
  settleExpiredPolls,
  toDate,
  validateMetadata,
  writePoll,
  type PollsPage,
  type PollsPageOptions,
  type PollsSortOrder,
} from './internal';
import { notifyCancelled, notifyClosed } from './notifications';
import {
  assertQuestionsReady,
  buildQuestions,
  type PollQuestionInput,
} from './questions';

const toBoolean = (value: unknown, what: string, fallback: boolean) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'boolean') {
    throw pollsError('BAD_USER_INPUT', `${what} must be true or false`);
  }
  return value;
};

const logPoll = (
  poll: Pick<PollDocument, '_id' | 'workspaceId'>,
  action: (typeof PollsAction)[keyof typeof PollsAction],
  userId: string,
  details?: Record<string, unknown>
) =>
  logActivity({
    workspaceId: poll.workspaceId,
    pollId: poll._id,
    entityType: PollsEntityType.POLL,
    entityId: poll._id,
    action,
    userId,
    ...(details ? { details } : {}),
  });

export interface CreatePollInput {
  workspaceId: string;
  title: string;
  /** When voting ends. Must be in the future when the poll is opened. */
  closesAt: Date | string | number;
  description?: string;
  /** Results never name voters. Default false. */
  anonymous?: boolean;
  tags?: string[];
  metadata?: PollsMetadata;
  questions?: PollQuestionInput[];
}

/** Creates a draft poll. Open it with `openPoll` to start voting. */
export async function createPoll(
  input: CreatePollInput,
  userId: string
): Promise<PollDocument> {
  requireUserId(userId);
  const workspace = await requireWorkspace(input.workspaceId);
  const title = normalizeTitle(input.title, 'Poll title');
  const closesAt = toDate(input.closesAt, 'End time');
  const description = normalizeText(input.description, 'Description');
  const metadata = validateMetadata(input.metadata);

  const date = new Date();
  const pollId = await Polls.insertAsync({
    workspaceId: workspace._id,
    title,
    ...(description ? { description } : {}),
    tags: normalizeTags(input.tags),
    ...(metadata ? { metadata } : {}),
    anonymous: toBoolean(input.anonymous, 'anonymous', false),
    questions: buildQuestions(input.questions),
    closesAt,
    status: PollStatus.DRAFT,
    voteCount: 0,
    revision: 0,
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });

  const poll = await requirePoll(pollId);
  await logPoll(poll, PollsAction.POLL_CREATED, userId, { title, closesAt });
  return poll;
}

export async function getPoll(
  pollId: string,
  userId: string
): Promise<PollDocument> {
  requireUserId(userId);
  return requirePoll(pollId);
}

export interface UpdatePollInput {
  title?: string;
  /** null clears it. */
  description?: string | null;
  /** Must be in the future while the poll is open. */
  closesAt?: Date | string | number;
  /** Drafts only. */
  anonymous?: boolean;
  tags?: string[];
  /** Replaces the whole object; null clears it. */
  metadata?: PollsMetadata | null;
}

/**
 * Changes a draft or open poll. Anonymity can only change while it is a
 * draft.
 */
export async function updatePoll(
  pollId: string,
  changes: UpdatePollInput,
  userId: string
): Promise<PollDocument> {
  requireUserId(userId);
  const poll = await requirePoll(pollId);

  const $set: Record<string, unknown> = {};
  const $unset: Record<string, 1> = {};
  let draftOnly = false;

  if (changes.title !== undefined) {
    $set.title = normalizeTitle(changes.title, 'Poll title');
  }
  if (changes.description !== undefined) {
    const description = normalizeText(changes.description, 'Description');
    if (description) $set.description = description;
    else $unset.description = 1;
  }
  if (changes.closesAt !== undefined) {
    const closesAt = toDate(changes.closesAt, 'End time');
    if (poll.status === PollStatus.OPEN) requireFuture(closesAt);
    $set.closesAt = closesAt;
  }
  if (changes.anonymous !== undefined) {
    const anonymous = toBoolean(changes.anonymous, 'anonymous', false);
    if (anonymous !== poll.anonymous) {
      draftOnly = true;
      $set.anonymous = anonymous;
    }
  }
  if (changes.tags !== undefined) $set.tags = normalizeTags(changes.tags);
  if (changes.metadata !== undefined) {
    const metadata = validateMetadata(changes.metadata);
    if (metadata) $set.metadata = metadata;
    else $unset.metadata = 1;
  }

  const updated = await writePoll(
    poll,
    userId,
    { $set, $unset },
    { allowed: draftOnly ? DRAFT_ONLY : EDITABLE_STATUSES }
  );
  const changed = Object.keys(changes).filter(
    key => changes[key as keyof UpdatePollInput] !== undefined
  );
  await logPoll(poll, PollsAction.POLL_UPDATED, userId, { changed });
  return updated;
}

/** Starts voting on a draft poll, optionally with a new end time. */
export async function openPoll(
  pollId: string,
  userId: string,
  { closesAt }: { closesAt?: Date | string | number } = {}
): Promise<PollDocument> {
  requireUserId(userId);
  const poll = await requirePoll(pollId);
  const end = closesAt !== undefined ? toDate(closesAt, 'End time') : poll.closesAt;
  requireFuture(end);
  assertQuestionsReady(poll.questions);
  const updated = await writePoll(
    poll,
    userId,
    {
      $set: {
        status: PollStatus.OPEN,
        closesAt: end,
        openedAt: new Date(),
        openedBy: userId,
      },
    },
    { allowed: DRAFT_ONLY }
  );
  await logPoll(poll, PollsAction.POLL_OPENED, userId, { closesAt: end });
  return updated;
}

/** Ends voting on an open poll before its end time. */
export async function closePoll(
  pollId: string,
  userId: string
): Promise<PollDocument> {
  requireUserId(userId);
  const poll = await requirePoll(pollId);
  const updated = await writePoll(
    poll,
    userId,
    {
      $set: {
        status: PollStatus.CLOSED,
        closedAt: new Date(),
        closedBy: userId,
      },
    },
    { allowed: OPEN_ONLY, checkRevision: false }
  );
  await logPoll(poll, PollsAction.POLL_CLOSED, userId);
  await notifyClosed(updated, userId);
  return updated;
}

/** Opens a closed poll again until a new end time. Votes are kept. */
export async function reopenPoll(
  pollId: string,
  { closesAt }: { closesAt: Date | string | number },
  userId: string
): Promise<PollDocument> {
  requireUserId(userId);
  const end = toDate(closesAt, 'End time');
  requireFuture(end);
  const poll = await requirePoll(pollId);
  const updated = await writePoll(
    poll,
    userId,
    {
      $set: { status: PollStatus.OPEN, closesAt: end },
      $unset: { closedAt: 1, closedBy: 1 },
    },
    { allowed: [PollStatus.CLOSED], checkRevision: false }
  );
  await logPoll(poll, PollsAction.POLL_REOPENED, userId, { closesAt: end });
  return updated;
}

/** Cancels a draft or open poll. A cancelled poll is read-only. */
export async function cancelPoll(
  pollId: string,
  userId: string,
  { reason }: { reason?: string } = {}
): Promise<PollDocument> {
  requireUserId(userId);
  const cancellationReason = normalizeText(reason, 'Reason');
  const poll = await requirePoll(pollId);
  const updated = await writePoll(
    poll,
    userId,
    {
      $set: {
        status: PollStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: userId,
        ...(cancellationReason ? { cancellationReason } : {}),
      },
    },
    { allowed: EDITABLE_STATUSES, checkRevision: false }
  );
  await logPoll(
    poll,
    PollsAction.POLL_CANCELLED,
    userId,
    cancellationReason ? { reason: cancellationReason } : undefined
  );
  // A draft was never visible to voters, so only an open poll is announced.
  if (poll.status === PollStatus.OPEN) await notifyCancelled(updated, userId);
  return updated;
}

/** Permanently deletes a poll and its ballots. Its activity is kept. */
export async function deletePoll(pollId: string, userId: string): Promise<void> {
  requireUserId(userId);
  const poll = await requirePoll(pollId);
  await PollBallots.removeAsync({ pollId });
  await Polls.removeAsync(pollId);
  await logPoll(poll, PollsAction.POLL_DELETED, userId, { title: poll.title });
}

interface PollFilterOptions {
  status?: PollStatusValue | PollStatusValue[];
  /** Polls that end after this time. */
  closesAfter?: Date;
  /** Polls that end before this time. */
  closesBefore?: Date;
  /** Polls that have all of these tags. */
  tags?: string[];
  /** `{ key: value }`: exact match on top-level metadata values. */
  metadata?: Record<string, unknown>;
  /** Default `closesAt`. */
  sortBy?: 'closesAt' | 'createdAt';
  /** Default `asc`. */
  sortOrder?: PollsSortOrder;
}

export interface ListPollsOptions extends PollFilterOptions, PollsPageOptions {
  /** Whole words in title, description and tags. */
  text?: string;
}

function buildFilter({
  status,
  closesAfter,
  closesBefore,
  tags,
  metadata,
}: PollFilterOptions): Record<string, unknown> {
  const selector: Record<string, unknown> = {};
  if (status !== undefined) {
    const statuses = (Array.isArray(status) ? status : [status]).map(value =>
      requireOneOf(value, PollStatus, 'Status')
    );
    selector.status = { $in: statuses };
  }
  if (closesAfter || closesBefore) {
    selector.closesAt = {
      ...(closesAfter ? { $gt: toDate(closesAfter, 'closesAfter') } : {}),
      ...(closesBefore ? { $lt: toDate(closesBefore, 'closesBefore') } : {}),
    };
  }
  const normalizedTags = normalizeTags(tags);
  if (normalizedTags.length) selector.tags = { $all: normalizedTags };
  Object.entries(metadata ?? {}).forEach(([key, value]) => {
    if (!METADATA_KEY_PATTERN.test(key)) {
      throw pollsError('BAD_USER_INPUT', `Invalid metadata key "${key}"`);
    }
    selector[`metadata.${key}`] = value;
  });
  return selector;
}

async function findPage(
  selector: Record<string, unknown>,
  { sortBy = 'closesAt', sortOrder }: PollFilterOptions,
  page: PollsPageOptions
): Promise<PollsPage<PollDocument>> {
  const { skip, limit } = normalizePage(page);
  const direction = sortOrder === 'desc' ? -1 : 1;
  const [data, totalResults] = await Promise.all([
    Polls.find(selector, {
      sort: { [sortBy]: direction, _id: direction },
      skip,
      limit,
    }).fetchAsync(),
    Polls.find(selector).countAsync(),
  ]);
  return { data, totalResults };
}

/** A workspace's polls. */
export async function listPolls(
  workspaceId: string,
  userId: string,
  {
    text,
    status,
    closesAfter,
    closesBefore,
    tags,
    metadata,
    sortBy,
    sortOrder,
    ...page
  }: ListPollsOptions = {}
): Promise<PollsPage<PollDocument>> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  await settleExpiredPolls({ workspaceId });

  const selector: Record<string, unknown> = {
    workspaceId,
    ...buildFilter({ status, closesAfter, closesBefore, tags, metadata }),
  };
  if (text?.trim()) selector.$text = { $search: text.trim() };
  return findPage(selector, { sortBy, sortOrder }, page);
}

export interface ListVoterPollsOptions
  extends PollFilterOptions,
    PollsPageOptions {
  /**
   * Only polls in these workspaces - the ones the caller has authorised.
   * Unset means every workspace. Deleted workspaces are always left out.
   */
  workspaceIds?: string[];
  /** true: only polls the voter has voted in; false: only the others. */
  voted?: boolean;
}

/**
 * Polls a voter can vote in (they are on the eligible list, or the poll has
 * none), across workspaces. Drafts are left out unless `status` asks for
 * them.
 */
export async function listVoterPolls(
  voterId: string,
  userId: string,
  {
    workspaceIds,
    voted,
    status = [PollStatus.OPEN, PollStatus.CLOSED],
    closesAfter,
    closesBefore,
    tags,
    metadata,
    sortBy,
    sortOrder,
    ...page
  }: ListVoterPollsOptions = {}
): Promise<PollsPage<PollDocument>> {
  requireUserId(userId);
  const id = normalizeOpaqueId(voterId, 'Voter id');
  const workspaceSelector = await liveWorkspaceSelector(workspaceIds);
  await settleExpiredPolls({ workspaceId: workspaceSelector });

  const selector: Record<string, unknown> = {
    workspaceId: workspaceSelector,
    ...buildFilter({ status, closesAfter, closesBefore, tags, metadata }),
  };
  if (voted !== undefined) {
    const ballots = await PollBallots.find(
      { voterId: id },
      { fields: { pollId: 1 } }
    ).fetchAsync();
    const pollIds = ballots.map(({ pollId }) => pollId);
    selector._id = voted ? { $in: pollIds } : { $nin: pollIds };
  }
  return findPage(selector, { sortBy, sortOrder }, page);
}
