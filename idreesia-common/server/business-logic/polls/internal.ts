import {
  POLLS_DEFAULT_PAGE_SIZE,
  POLLS_MAX_PAGE_SIZE,
  POLLS_MAX_TITLE_LENGTH,
  PollStatus,
  type PollStatusValue,
} from 'meteor/idreesia-common/constants/polls';
import {
  Polls,
  PollsWorkspaces,
  type PollDocument,
  type PollsMetadata,
  type PollsWorkspaceDocument,
} from 'meteor/idreesia-common/server/collections/polls';

import { pollsError } from './errors';

// The validation helpers below mirror those of the meetings module on
// purpose: the modules are independent and must not import each other's
// internals.

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

/** Every call names the acting user, for audit fields and the log. */
export function requireUserId(userId: unknown): asserts userId is string {
  if (typeof userId !== 'string' || !userId) {
    throw pollsError('BAD_USER_INPUT', 'A user id is required');
  }
}

const hasControlCharacters = (value: string) =>
  [...value].some(char => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });

/**
 * Trims and checks a single-line title (workspace name, poll title, question
 * or option text).
 */
export function normalizeTitle(
  value: unknown,
  what = 'Title',
  maxLength = POLLS_MAX_TITLE_LENGTH
): string {
  if (typeof value !== 'string') {
    throw pollsError('BAD_USER_INPUT', `${what} is required`);
  }
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) throw pollsError('BAD_USER_INPUT', `${what} is required`);
  if (trimmed.length > maxLength) {
    throw pollsError(
      'BAD_USER_INPUT',
      `${what} must be at most ${maxLength} characters`
    );
  }
  if (hasControlCharacters(trimmed)) {
    throw pollsError('BAD_USER_INPUT', `${what} contains invalid characters`);
  }
  return trimmed;
}

export const MAX_TEXT_LENGTH = 10_000;

/** Trimmed multi-line text, or undefined when empty. */
export function normalizeText(
  value: unknown,
  what = 'Text',
  maxLength = MAX_TEXT_LENGTH
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw pollsError('BAD_USER_INPUT', `${what} must be text`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw pollsError(
      'BAD_USER_INPUT',
      `${what} must be at most ${maxLength} characters`
    );
  }
  return trimmed || undefined;
}

const MAX_ID_LENGTH = 128;

/** An id the caller chooses (voter). */
export function normalizeOpaqueId(value: unknown, what = 'Id'): string {
  const id = typeof value === 'string' ? value.trim() : '';
  if (!id) throw pollsError('BAD_USER_INPUT', `${what} is required`);
  if (id.length > MAX_ID_LENGTH || hasControlCharacters(id)) {
    throw pollsError('BAD_USER_INPUT', `${what} is not a valid id`);
  }
  return id;
}

/** A Date, ISO string or epoch milliseconds, as a valid Date. */
export function toDate(value: unknown, what = 'Date'): Date {
  let date: Date | null = null;
  if (value instanceof Date) date = new Date(value.getTime());
  else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  }
  if (!date || Number.isNaN(date.getTime())) {
    throw pollsError('BAD_USER_INPUT', `${what} must be a valid date`);
  }
  return date;
}

/** A time that hasn't passed yet. */
export function requireFuture(date: Date, what = 'End time') {
  if (date.getTime() <= Date.now()) {
    throw pollsError('BAD_USER_INPUT', `${what} must be in the future`);
  }
}

export function requireOneOf<T extends string>(
  value: unknown,
  allowed: Record<string, T>,
  what: string
): T {
  const values = Object.values(allowed);
  if (typeof value !== 'string' || !values.includes(value as T)) {
    throw pollsError(
      'BAD_USER_INPUT',
      `${what} must be one of: ${values.join(', ')}`
    );
  }
  return value as T;
}

const MAX_TAGS = 50;
const MAX_TAG_LENGTH = 64;

/** Trimmed, lower-cased, de-duplicated tags. */
export function normalizeTags(tags: unknown): string[] {
  if (tags === undefined || tags === null) return [];
  if (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string')) {
    throw pollsError('BAD_USER_INPUT', 'Tags must be a list of strings');
  }
  const normalized = [
    ...new Set(
      (tags as string[])
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
    ),
  ];
  if (normalized.length > MAX_TAGS) {
    throw pollsError('BAD_USER_INPUT', `At most ${MAX_TAGS} tags are allowed`);
  }
  if (normalized.some(tag => tag.length > MAX_TAG_LENGTH)) {
    throw pollsError(
      'BAD_USER_INPUT',
      `Tags must be at most ${MAX_TAG_LENGTH} characters`
    );
  }
  return normalized;
}

/** Metadata keys are queryable as `metadata.<key>`, so they are restricted. */
export const METADATA_KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function validateMetadata(metadata: unknown): PollsMetadata | undefined {
  if (metadata === undefined || metadata === null) return undefined;
  if (
    typeof metadata !== 'object' ||
    Array.isArray(metadata) ||
    Object.getPrototypeOf(metadata) !== Object.prototype
  ) {
    throw pollsError('BAD_USER_INPUT', 'Metadata must be a plain object');
  }
  const badKey = Object.keys(metadata).find(
    key => !METADATA_KEY_PATTERN.test(key)
  );
  if (badKey !== undefined) {
    throw pollsError(
      'BAD_USER_INPUT',
      `Invalid metadata key "${badKey}" (letters, digits, _ and - only)`
    );
  }
  return metadata as PollsMetadata;
}

export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export async function requireWorkspace(
  workspaceId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<PollsWorkspaceDocument> {
  const workspace = workspaceId
    ? await PollsWorkspaces.findOneAsync(workspaceId)
    : undefined;
  if (!workspace || (!includeDeleted && workspace.deletedAt)) {
    throw pollsError('NOT_FOUND', 'Workspace not found');
  }
  return workspace;
}

/**
 * Closes open polls whose end time has passed, recording `closedAt` as their
 * end time and no `closedBy`. Runs before polls are read or changed, so no
 * background job is needed. `scope` narrows it, e.g. `{ _id }` or
 * `{ workspaceId }`.
 */
export async function settleExpiredPolls(
  scope: Record<string, unknown> = {}
): Promise<void> {
  await Polls.rawCollection().updateMany(
    { ...scope, status: PollStatus.OPEN, closesAt: { $lte: new Date() } },
    [
      {
        $set: {
          status: PollStatus.CLOSED,
          closedAt: '$closesAt',
          revision: { $add: ['$revision', 1] },
        },
      },
    ]
  );
}

/** A poll in a live workspace (and in `workspaceId`, when given). */
export async function requirePoll(
  pollId: string,
  { workspaceId }: { workspaceId?: string } = {}
): Promise<PollDocument> {
  if (pollId) await settleExpiredPolls({ _id: pollId });
  const poll = pollId ? await Polls.findOneAsync(pollId) : undefined;
  if (!poll || (workspaceId && poll.workspaceId !== workspaceId)) {
    throw pollsError('NOT_FOUND', 'Poll not found');
  }
  await requireWorkspace(poll.workspaceId).catch(() => {
    throw pollsError('NOT_FOUND', 'Poll not found');
  });
  return poll;
}

/**
 * A `workspaceId` condition matching live workspaces: those among
 * `workspaceIds`, or every workspace that isn't deleted.
 */
export async function liveWorkspaceSelector(workspaceIds?: string[]) {
  if (workspaceIds) {
    const live = await PollsWorkspaces.find(
      { _id: { $in: workspaceIds }, deletedAt: { $exists: false } },
      { fields: { _id: 1 } }
    ).fetchAsync();
    return { $in: live.map(({ _id }) => _id) };
  }
  const deleted = await PollsWorkspaces.find(
    { deletedAt: { $exists: true } },
    { fields: { _id: 1 } }
  ).fetchAsync();
  return { $nin: deleted.map(({ _id }) => _id) };
}

// ---------------------------------------------------------------------------
// Poll state and guarded writes
// ---------------------------------------------------------------------------

export const DRAFT_ONLY: PollStatusValue[] = [PollStatus.DRAFT];
export const OPEN_ONLY: PollStatusValue[] = [PollStatus.OPEN];
/** States in which a poll's title, description, end time... can change. */
export const EDITABLE_STATUSES: PollStatusValue[] = [
  PollStatus.DRAFT,
  PollStatus.OPEN,
];

export const statusConflict = (
  poll: Pick<PollDocument, 'status'>,
  allowed: PollStatusValue[]
) =>
  pollsError(
    'CONFLICT',
    `This can't be done on ${/^[aeiou]/.test(poll.status) ? 'an' : 'a'} ${poll.status} poll (only ${allowed.join(' or ')})`,
    { status: poll.status }
  );

export function assertStatus(poll: PollDocument, allowed: PollStatusValue[]) {
  if (!allowed.includes(poll.status)) {
    throw statusConflict(poll, allowed);
  }
}

interface PollModifier {
  $set?: Record<string, unknown>;
  $unset?: Record<string, 1>;
  $inc?: Record<string, number>;
  $addToSet?: Record<string, unknown>;
}

/**
 * Updates a poll that `poll` was read from, provided it is still in one of
 * the `allowed` states and - with `checkRevision` - unchanged since it was
 * read. Open polls also must not have passed their end time, so a change
 * can't land on a poll that has just closed. Returns the updated poll.
 */
export async function writePoll(
  poll: PollDocument,
  userId: string,
  modifier: PollModifier,
  {
    allowed,
    checkRevision = true,
  }: { allowed: PollStatusValue[]; checkRevision?: boolean }
): Promise<PollDocument> {
  assertStatus(poll, allowed);
  const now = new Date();
  const selector: Record<string, unknown> = {
    _id: poll._id,
    status: { $in: allowed },
    ...(checkRevision ? { revision: poll.revision } : {}),
  };
  if (allowed.includes(PollStatus.OPEN)) {
    selector.$or = [
      { status: { $ne: PollStatus.OPEN } },
      { closesAt: { $gt: now } },
    ];
  }
  const update: PollModifier = {
    ...(modifier.$addToSet ? { $addToSet: modifier.$addToSet } : {}),
    $set: { ...modifier.$set, updatedAt: now, updatedBy: userId },
    $inc: { ...modifier.$inc, revision: 1 },
  };
  if (modifier.$unset && Object.keys(modifier.$unset).length) {
    update.$unset = modifier.$unset;
  }

  const updated = await Polls.updateAsync(selector, update);
  if (!updated) {
    const current = await requirePoll(poll._id);
    if (!allowed.includes(current.status)) {
      throw statusConflict(current, allowed);
    }
    throw pollsError(
      'CONFLICT',
      'The poll was changed by another request; reload and try again'
    );
  }
  return (await Polls.findOneAsync(poll._id))!;
}

// ---------------------------------------------------------------------------
// Paging
// ---------------------------------------------------------------------------

export interface PollsPageOptions {
  skip?: number;
  limit?: number;
}

export interface PollsPage<T> {
  data: T[];
  totalResults: number;
}

export function normalizePage({ skip, limit }: PollsPageOptions = {}) {
  const toInt = (value: unknown, fallback: number) =>
    Number.isFinite(value) ? Math.floor(value as number) : fallback;
  return {
    skip: Math.max(0, toInt(skip, 0)),
    limit: Math.min(
      POLLS_MAX_PAGE_SIZE,
      Math.max(1, toInt(limit, POLLS_DEFAULT_PAGE_SIZE))
    ),
  };
}

export type PollsSortOrder = 'asc' | 'desc';
