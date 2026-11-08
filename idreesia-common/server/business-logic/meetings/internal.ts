import {
  MEETINGS_DEFAULT_MAX_FILE_SIZE,
  MEETINGS_DEFAULT_PAGE_SIZE,
  MEETINGS_MAX_PAGE_SIZE,
  MEETINGS_MAX_TITLE_LENGTH,
  MeetingStatus,
  type MeetingStatusValue,
} from 'meteor/idreesia-common/constants/meetings';
import {
  Meetings,
  MeetingsWorkspaces,
  type MeetingDocument,
  type MeetingsMetadata,
  type MeetingsWorkspaceDocument,
} from 'meteor/idreesia-common/server/collections/meetings';
import {
  deleteFiles,
  getFileExtension,
  StorageFolders,
} from 'meteor/idreesia-common/server/file-storage';

import { meetingsError } from './errors';

// The validation helpers below mirror those of the DMS on purpose: the two
// modules are independent and must not import each other's internals.

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

/** Every call names the acting user, for audit fields and the log. */
export function requireUserId(userId: unknown): asserts userId is string {
  if (typeof userId !== 'string' || !userId) {
    throw meetingsError('BAD_USER_INPUT', 'A user id is required');
  }
}

const hasControlCharacters = (value: string) =>
  [...value].some(char => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });

/**
 * Trims and checks a single-line title (workspace name, meeting title,
 * agenda item, action item, attachment name).
 */
export function normalizeTitle(value: unknown, what = 'Title'): string {
  if (typeof value !== 'string') {
    throw meetingsError('BAD_USER_INPUT', `${what} is required`);
  }
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) throw meetingsError('BAD_USER_INPUT', `${what} is required`);
  if (trimmed.length > MEETINGS_MAX_TITLE_LENGTH) {
    throw meetingsError(
      'BAD_USER_INPUT',
      `${what} must be at most ${MEETINGS_MAX_TITLE_LENGTH} characters`
    );
  }
  if (hasControlCharacters(trimmed)) {
    throw meetingsError('BAD_USER_INPUT', `${what} contains invalid characters`);
  }
  return trimmed;
}

/** A title that is also a valid file name (no slashes, no `.`/`..`). */
export function normalizeFileName(value: unknown, what = 'File name'): string {
  const name = normalizeTitle(value, what);
  if (name === '.' || name === '..' || /[/\\]/.test(name)) {
    throw meetingsError('BAD_USER_INPUT', `${what} contains invalid characters`);
  }
  return name;
}

export const MAX_TEXT_LENGTH = 10_000;
export const MAX_MINUTES_LENGTH = 500_000;

/** Trimmed multi-line text, or undefined when empty. */
export function normalizeText(
  value: unknown,
  what = 'Text',
  maxLength = MAX_TEXT_LENGTH
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw meetingsError('BAD_USER_INPUT', `${what} must be text`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw meetingsError(
      'BAD_USER_INPUT',
      `${what} must be at most ${maxLength} characters`
    );
  }
  return trimmed || undefined;
}

const MAX_ID_LENGTH = 128;

/** An id the caller chooses (participant, assignee, presenter). */
export function normalizeOpaqueId(value: unknown, what = 'Id'): string {
  const id = typeof value === 'string' ? value.trim() : '';
  if (!id) throw meetingsError('BAD_USER_INPUT', `${what} is required`);
  if (id.length > MAX_ID_LENGTH || hasControlCharacters(id)) {
    throw meetingsError('BAD_USER_INPUT', `${what} is not a valid id`);
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
    throw meetingsError('BAD_USER_INPUT', `${what} must be a valid date`);
  }
  return date;
}

export function validateTimeZone(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw meetingsError('BAD_USER_INPUT', 'A time zone is required');
  }
  const timeZone = value.trim();
  try {
    Intl.DateTimeFormat('en-US', { timeZone }).resolvedOptions();
  } catch {
    throw meetingsError('BAD_USER_INPUT', `Unknown time zone "${timeZone}"`);
  }
  return timeZone;
}

/** An http(s) URL, e.g. an online meeting link. */
export function normalizeUrl(value: unknown, what = 'URL'): string | undefined {
  const text = normalizeText(value, what, 2048);
  if (!text) return undefined;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw meetingsError('BAD_USER_INPUT', `${what} must be a valid URL`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw meetingsError('BAD_USER_INPUT', `${what} must be an http(s) URL`);
  }
  return text;
}

export function requireOneOf<T extends string>(
  value: unknown,
  allowed: Record<string, T>,
  what: string
): T {
  const values = Object.values(allowed);
  if (typeof value !== 'string' || !values.includes(value as T)) {
    throw meetingsError(
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
    throw meetingsError('BAD_USER_INPUT', 'Tags must be a list of strings');
  }
  const normalized = [
    ...new Set(
      (tags as string[])
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
    ),
  ];
  if (normalized.length > MAX_TAGS) {
    throw meetingsError('BAD_USER_INPUT', `At most ${MAX_TAGS} tags are allowed`);
  }
  if (normalized.some(tag => tag.length > MAX_TAG_LENGTH)) {
    throw meetingsError(
      'BAD_USER_INPUT',
      `Tags must be at most ${MAX_TAG_LENGTH} characters`
    );
  }
  return normalized;
}

/** Metadata keys are queryable as `metadata.<key>`, so they are restricted. */
export const METADATA_KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function validateMetadata(
  metadata: unknown
): MeetingsMetadata | undefined {
  if (metadata === undefined || metadata === null) return undefined;
  if (
    typeof metadata !== 'object' ||
    Array.isArray(metadata) ||
    Object.getPrototypeOf(metadata) !== Object.prototype
  ) {
    throw meetingsError('BAD_USER_INPUT', 'Metadata must be a plain object');
  }
  const badKey = Object.keys(metadata).find(
    key => !METADATA_KEY_PATTERN.test(key)
  );
  if (badKey !== undefined) {
    throw meetingsError(
      'BAD_USER_INPUT',
      `Invalid metadata key "${badKey}" (letters, digits, _ and - only)`
    );
  }
  return metadata as MeetingsMetadata;
}

const MIME_TYPE_PATTERN = /^[\w.+-]+\/[\w.+-]+$/;

/** Lower-cased MIME type without parameters (`; charset=...`). */
export function normalizeMimeType(mimeType: unknown): string {
  const value =
    typeof mimeType === 'string'
      ? mimeType.split(';')[0].trim().toLowerCase()
      : '';
  if (!MIME_TYPE_PATTERN.test(value)) {
    throw meetingsError('BAD_USER_INPUT', 'A valid MIME type is required');
  }
  return value;
}

const isMimeTypeAllowed = (mimeType: string, allowed: string[]) =>
  allowed.some(pattern => {
    const normalized = pattern.trim().toLowerCase();
    return normalized.endsWith('/*')
      ? mimeType.startsWith(normalized.slice(0, -1))
      : mimeType === normalized;
  });

/** Checks a file against the workspace's size and type limits. */
export function validateFile(
  workspace: MeetingsWorkspaceDocument,
  size: number,
  mimeType: string
) {
  if (!Number.isSafeInteger(size) || size < 0) {
    throw meetingsError('BAD_USER_INPUT', 'A valid file size is required');
  }
  const maxFileSize =
    workspace.settings?.maxFileSize ?? MEETINGS_DEFAULT_MAX_FILE_SIZE;
  if (size > maxFileSize) {
    throw meetingsError(
      'TOO_LARGE',
      `File is larger than the ${maxFileSize} byte limit`,
      { maxFileSize }
    );
  }
  const allowed = workspace.settings?.allowedMimeTypes;
  if (allowed?.length && !isMimeTypeAllowed(mimeType, allowed)) {
    throw meetingsError(
      'BAD_USER_INPUT',
      `Files of type ${mimeType} are not allowed in this workspace`
    );
  }
}

export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export async function requireWorkspace(
  workspaceId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<MeetingsWorkspaceDocument> {
  const workspace = workspaceId
    ? await MeetingsWorkspaces.findOneAsync(workspaceId)
    : undefined;
  if (!workspace || (!includeDeleted && workspace.deletedAt)) {
    throw meetingsError('NOT_FOUND', 'Workspace not found');
  }
  return workspace;
}

/** A meeting in a live workspace (and in `workspaceId`, when given). */
export async function requireMeeting(
  meetingId: string,
  { workspaceId }: { workspaceId?: string } = {}
): Promise<MeetingDocument> {
  const meeting = meetingId ? await Meetings.findOneAsync(meetingId) : undefined;
  if (!meeting || (workspaceId && meeting.workspaceId !== workspaceId)) {
    throw meetingsError('NOT_FOUND', 'Meeting not found');
  }
  await requireWorkspace(meeting.workspaceId).catch(() => {
    throw meetingsError('NOT_FOUND', 'Meeting not found');
  });
  return meeting;
}

/**
 * A `workspaceId` condition matching live workspaces: those among
 * `workspaceIds`, or every workspace that isn't deleted.
 */
export async function liveWorkspaceSelector(workspaceIds?: string[]) {
  if (workspaceIds) {
    const live = await MeetingsWorkspaces.find(
      { _id: { $in: workspaceIds }, deletedAt: { $exists: false } },
      { fields: { _id: 1 } }
    ).fetchAsync();
    return { $in: live.map(({ _id }) => _id) };
  }
  const deleted = await MeetingsWorkspaces.find(
    { deletedAt: { $exists: true } },
    { fields: { _id: 1 } }
  ).fetchAsync();
  return { $nin: deleted.map(({ _id }) => _id) };
}

// ---------------------------------------------------------------------------
// Meeting state and guarded writes
// ---------------------------------------------------------------------------

/** States in which a meeting's details, agenda, minutes, etc. can change. */
export const EDITABLE_STATUSES: MeetingStatusValue[] = [
  MeetingStatus.SCHEDULED,
  MeetingStatus.COMPLETED,
];

/** Only a scheduled meeting's time and invitations can change. */
export const SCHEDULED_ONLY: MeetingStatusValue[] = [MeetingStatus.SCHEDULED];

export const statusConflict = (
  meeting: Pick<MeetingDocument, 'status'>,
  allowed: MeetingStatusValue[]
) =>
  meetingsError(
    'CONFLICT',
    `This can't be done on a ${meeting.status} meeting (only ${allowed.join(' or ')})`,
    { status: meeting.status }
  );

export function assertStatus(
  meeting: MeetingDocument,
  allowed: MeetingStatusValue[]
) {
  if (!allowed.includes(meeting.status)) {
    throw statusConflict(meeting, allowed);
  }
}

interface MeetingModifier {
  $set?: Record<string, unknown>;
  $unset?: Record<string, 1>;
  $inc?: Record<string, number>;
}

/**
 * Updates a meeting that `meeting` was read from, provided it is still in
 * one of the `allowed` states and - with `checkRevision` - unchanged since
 * it was read. Changes to the embedded participants and agenda are computed
 * from the read copy, so they always check the revision, which makes
 * concurrent read-modify-write updates fail instead of overwriting each
 * other. Returns the updated meeting.
 */
export async function writeMeeting(
  meeting: MeetingDocument,
  userId: string,
  modifier: MeetingModifier,
  {
    allowed,
    checkRevision = true,
  }: { allowed: MeetingStatusValue[]; checkRevision?: boolean }
): Promise<MeetingDocument> {
  assertStatus(meeting, allowed);
  const selector: Record<string, unknown> = {
    _id: meeting._id,
    status: { $in: allowed },
    ...(checkRevision ? { revision: meeting.revision } : {}),
  };
  const update: MeetingModifier = {
    $set: { ...modifier.$set, updatedAt: new Date(), updatedBy: userId },
    $inc: { ...modifier.$inc, revision: 1 },
  };
  if (modifier.$unset && Object.keys(modifier.$unset).length) {
    update.$unset = modifier.$unset;
  }

  const updated = await Meetings.updateAsync(selector, update);
  if (!updated) {
    const current = await Meetings.findOneAsync(meeting._id);
    if (!current) throw meetingsError('NOT_FOUND', 'Meeting not found');
    if (!allowed.includes(current.status)) {
      throw statusConflict(current, allowed);
    }
    throw meetingsError(
      'CONFLICT',
      'The meeting was changed by another request; reload and try again'
    );
  }
  return (await Meetings.findOneAsync(meeting._id))!;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/** `meeting-attachments/<workspaceId>/<meetingId>/<attachmentId>.<ext>` */
export const getAttachmentFileKey = (
  workspaceId: string,
  meetingId: string,
  attachmentId: string,
  fileName: string,
  mimeType: string
) =>
  `${StorageFolders.MeetingAttachments}/${workspaceId}/${meetingId}/${attachmentId}.${getFileExtension(fileName, mimeType)}`;

/**
 * Deletes stored files after their records are gone. A leftover file is
 * harmless, so failures are only reported.
 */
export async function deleteFilesQuietly(keys: string[]) {
  if (!keys.length) return;
  try {
    await deleteFiles(keys);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[meetings] Could not delete ${keys.length} stored files`,
      error
    );
  }
}

// ---------------------------------------------------------------------------
// Paging
// ---------------------------------------------------------------------------

export interface MeetingsPageOptions {
  skip?: number;
  limit?: number;
}

export interface MeetingsPage<T> {
  data: T[];
  totalResults: number;
}

export function normalizePage({ skip, limit }: MeetingsPageOptions = {}) {
  const toInt = (value: unknown, fallback: number) =>
    Number.isFinite(value) ? Math.floor(value as number) : fallback;
  return {
    skip: Math.max(0, toInt(skip, 0)),
    limit: Math.min(
      MEETINGS_MAX_PAGE_SIZE,
      Math.max(1, toInt(limit, MEETINGS_DEFAULT_PAGE_SIZE))
    ),
  };
}

export type MeetingsSortOrder = 'asc' | 'desc';
