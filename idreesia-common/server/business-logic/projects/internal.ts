import {
  OpenProjectStatuses,
  PROJECTS_DEFAULT_PAGE_SIZE,
  PROJECTS_MAX_PAGE_SIZE,
  PROJECTS_MAX_PARTICIPANTS,
  PROJECTS_MAX_TITLE_LENGTH,
  TaskStatus,
} from 'meteor/idreesia-common/constants/projects';
import {
  Projects,
  ProjectsWorkspaces,
  ProjectTasks,
  type ProjectDocument,
  type ProjectsMetadata,
  type ProjectsWorkspaceDocument,
  type ProjectTaskDocument,
} from 'meteor/idreesia-common/server/collections/projects';

import { projectsError } from './errors';

// The validation helpers below mirror those of the meetings module on
// purpose: the modules are independent and must not import each other's
// internals.

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

/** Every call names the acting user, for audit fields and the log. */
export function requireUserId(userId: unknown): asserts userId is string {
  if (typeof userId !== 'string' || !userId) {
    throw projectsError('BAD_USER_INPUT', 'A user id is required');
  }
}

const hasControlCharacters = (value: string) =>
  [...value].some(char => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });

/**
 * Trims and checks a single-line title (workspace name, project or task title).
 */
export function normalizeTitle(
  value: unknown,
  what = 'Title',
  maxLength = PROJECTS_MAX_TITLE_LENGTH
): string {
  if (typeof value !== 'string') {
    throw projectsError('BAD_USER_INPUT', `${what} is required`);
  }
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) throw projectsError('BAD_USER_INPUT', `${what} is required`);
  if (trimmed.length > maxLength) {
    throw projectsError(
      'BAD_USER_INPUT',
      `${what} must be at most ${maxLength} characters`
    );
  }
  if (hasControlCharacters(trimmed)) {
    throw projectsError('BAD_USER_INPUT', `${what} contains invalid characters`);
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
    throw projectsError('BAD_USER_INPUT', `${what} must be text`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw projectsError(
      'BAD_USER_INPUT',
      `${what} must be at most ${maxLength} characters`
    );
  }
  return trimmed || undefined;
}

const MAX_ID_LENGTH = 128;

/** An id the caller chooses (assignee, participant, author). */
export function normalizeOpaqueId(value: unknown, what = 'Id'): string {
  const id = typeof value === 'string' ? value.trim() : '';
  if (!id) throw projectsError('BAD_USER_INPUT', `${what} is required`);
  if (id.length > MAX_ID_LENGTH || hasControlCharacters(id)) {
    throw projectsError('BAD_USER_INPUT', `${what} is not a valid id`);
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
    throw projectsError('BAD_USER_INPUT', `${what} must be a valid date`);
  }
  return date;
}

/** A time that hasn't passed yet. */
export function requireOneOf<T extends string>(
  value: unknown,
  allowed: Record<string, T>,
  what: string
): T {
  const values = Object.values(allowed);
  if (typeof value !== 'string' || !values.includes(value as T)) {
    throw projectsError(
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
    throw projectsError('BAD_USER_INPUT', 'Tags must be a list of strings');
  }
  const normalized = [
    ...new Set(
      (tags as string[])
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)
    ),
  ];
  if (normalized.length > MAX_TAGS) {
    throw projectsError('BAD_USER_INPUT', `At most ${MAX_TAGS} tags are allowed`);
  }
  if (normalized.some(tag => tag.length > MAX_TAG_LENGTH)) {
    throw projectsError(
      'BAD_USER_INPUT',
      `Tags must be at most ${MAX_TAG_LENGTH} characters`
    );
  }
  return normalized;
}

/** Metadata keys are queryable as `metadata.<key>`, so they are restricted. */
export const METADATA_KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function validateMetadata(metadata: unknown): ProjectsMetadata | undefined {
  if (metadata === undefined || metadata === null) return undefined;
  if (
    typeof metadata !== 'object' ||
    Array.isArray(metadata) ||
    Object.getPrototypeOf(metadata) !== Object.prototype
  ) {
    throw projectsError('BAD_USER_INPUT', 'Metadata must be a plain object');
  }
  const badKey = Object.keys(metadata).find(
    key => !METADATA_KEY_PATTERN.test(key)
  );
  if (badKey !== undefined) {
    throw projectsError(
      'BAD_USER_INPUT',
      `Invalid metadata key "${badKey}" (letters, digits, _ and - only)`
    );
  }
  return metadata as ProjectsMetadata;
}

export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

export async function requireWorkspace(
  workspaceId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<ProjectsWorkspaceDocument> {
  const workspace = workspaceId
    ? await ProjectsWorkspaces.findOneAsync(workspaceId)
    : undefined;
  if (!workspace || (!includeDeleted && workspace.deletedAt)) {
    throw projectsError('NOT_FOUND', 'Workspace not found');
  }
  return workspace;
}

/** A project in a live workspace (and in `workspaceId`, when given). */
export async function requireProject(
  projectId: string,
  { workspaceId }: { workspaceId?: string } = {}
): Promise<ProjectDocument> {
  const project = projectId
    ? await Projects.findOneAsync(projectId)
    : undefined;
  if (!project || (workspaceId && project.workspaceId !== workspaceId)) {
    throw projectsError('NOT_FOUND', 'Project not found');
  }
  await requireWorkspace(project.workspaceId).catch(() => {
    throw projectsError('NOT_FOUND', 'Project not found');
  });
  return project;
}

/** A task in a live workspace (and in `workspaceId`, when given). */
export async function requireTask(
  taskId: string,
  { workspaceId }: { workspaceId?: string } = {}
): Promise<ProjectTaskDocument> {
  const task = taskId ? await ProjectTasks.findOneAsync(taskId) : undefined;
  if (!task || (workspaceId && task.workspaceId !== workspaceId)) {
    throw projectsError('NOT_FOUND', 'Task not found');
  }
  await requireWorkspace(task.workspaceId).catch(() => {
    throw projectsError('NOT_FOUND', 'Task not found');
  });
  return task;
}

/**
 * A `workspaceId` condition matching live workspaces: those among
 * `workspaceIds`, or every workspace that isn't deleted.
 */
export async function liveWorkspaceSelector(workspaceIds?: string[]) {
  if (workspaceIds) {
    const live = await ProjectsWorkspaces.find(
      { _id: { $in: workspaceIds }, deletedAt: { $exists: false } },
      { fields: { _id: 1 } }
    ).fetchAsync();
    return { $in: live.map(({ _id }) => _id) };
  }
  const deleted = await ProjectsWorkspaces.find(
    { deletedAt: { $exists: true } },
    { fields: { _id: 1 } }
  ).fetchAsync();
  return { $nin: deleted.map(({ _id }) => _id) };
}

// ---------------------------------------------------------------------------
// Participants
// ---------------------------------------------------------------------------

/** Trimmed, de-duplicated opaque ids. */
export function normalizeIdList(
  ids: unknown,
  what = 'Participant id'
): string[] {
  if (!Array.isArray(ids)) {
    throw projectsError('BAD_USER_INPUT', `${what}s must be a list`);
  }
  const list = [...new Set(ids.map(id => normalizeOpaqueId(id, what)))];
  if (list.length > PROJECTS_MAX_PARTICIPANTS) {
    throw projectsError(
      'BAD_USER_INPUT',
      `At most ${PROJECTS_MAX_PARTICIPANTS} participants are allowed`
    );
  }
  return list;
}

// ---------------------------------------------------------------------------
// Status rules and guarded writes
// ---------------------------------------------------------------------------

export const isProjectOpen = (project: Pick<ProjectDocument, 'status'>) =>
  OpenProjectStatuses.includes(project.status);

/** Tasks of a completed or cancelled project are read-only. */
export function assertProjectOpen(project: ProjectDocument) {
  if (!isProjectOpen(project)) {
    throw projectsError(
      'CONFLICT',
      `This can't be done on a ${project.status} project`,
      { status: project.status }
    );
  }
}

interface Modifier {
  $set?: Record<string, unknown>;
  $unset?: Record<string, 1>;
  $inc?: Record<string, number>;
}

const buildUpdate = (userId: string, modifier: Modifier): Modifier => {
  const update: Modifier = {
    $set: { ...modifier.$set, updatedAt: new Date(), updatedBy: userId },
    $inc: { ...modifier.$inc, revision: 1 },
  };
  if (modifier.$unset && Object.keys(modifier.$unset).length) {
    update.$unset = modifier.$unset;
  }
  return update;
};

/**
 * Updates a project that `project` was read from. With `checkRevision`, it
 * must be unchanged since it was read, or this fails with CONFLICT.
 */
export async function writeProject(
  project: ProjectDocument,
  userId: string,
  modifier: Modifier,
  { checkRevision = true }: { checkRevision?: boolean } = {}
): Promise<ProjectDocument> {
  const selector: Record<string, unknown> = {
    _id: project._id,
    ...(checkRevision ? { revision: project.revision } : {}),
  };
  const updated = await Projects.updateAsync(
    selector,
    buildUpdate(userId, modifier)
  );
  if (!updated) {
    await requireProject(project._id);
    throw projectsError(
      'CONFLICT',
      'The project was changed by another request; reload and try again'
    );
  }
  return (await Projects.findOneAsync(project._id))!;
}

/** Same as `writeProject`, for tasks. */
export async function writeTask(
  task: ProjectTaskDocument,
  userId: string,
  modifier: Modifier,
  { checkRevision = true }: { checkRevision?: boolean } = {}
): Promise<ProjectTaskDocument> {
  const selector: Record<string, unknown> = {
    _id: task._id,
    ...(checkRevision ? { revision: task.revision } : {}),
  };
  const updated = await ProjectTasks.updateAsync(
    selector,
    buildUpdate(userId, modifier)
  );
  if (!updated) {
    await requireTask(task._id);
    throw projectsError(
      'CONFLICT',
      'The task was changed by another request; reload and try again'
    );
  }
  return (await ProjectTasks.findOneAsync(task._id))!;
}

/**
 * Recomputes a project's task counts and progress from its tasks. Cancelled
 * tasks don't count. A project without counted tasks has progress 0.
 */
export async function refreshProjectStats(projectId: string): Promise<void> {
  const [stats] = await ProjectTasks.rawCollection()
    .aggregate<{ taskCount: number; doneCount: number; total: number }>([
      { $match: { projectId, status: { $ne: TaskStatus.CANCELLED } } },
      {
        $group: {
          _id: null,
          taskCount: { $sum: 1 },
          doneCount: {
            $sum: { $cond: [{ $eq: ['$status', TaskStatus.DONE] }, 1, 0] },
          },
          total: { $sum: '$progress' },
        },
      },
    ])
    .toArray();
  const taskCount = stats?.taskCount ?? 0;
  await Projects.updateAsync(projectId, {
    $set: {
      taskCount,
      doneCount: stats?.doneCount ?? 0,
      progress: taskCount ? Math.round(stats.total / taskCount) : 0,
    },
  });
}

// ---------------------------------------------------------------------------
// Paging
// ---------------------------------------------------------------------------

export interface ProjectsPageOptions {
  skip?: number;
  limit?: number;
}

export interface ProjectsPage<T> {
  data: T[];
  totalResults: number;
}

export function normalizePage({ skip, limit }: ProjectsPageOptions = {}) {
  const toInt = (value: unknown, fallback: number) =>
    Number.isFinite(value) ? Math.floor(value as number) : fallback;
  return {
    skip: Math.max(0, toInt(skip, 0)),
    limit: Math.min(
      PROJECTS_MAX_PAGE_SIZE,
      Math.max(1, toInt(limit, PROJECTS_DEFAULT_PAGE_SIZE))
    ),
  };
}

export type ProjectsSortOrder = 'asc' | 'desc';
