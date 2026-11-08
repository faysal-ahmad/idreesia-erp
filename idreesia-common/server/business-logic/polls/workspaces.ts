import {
  PollsAction,
  PollsEntityType,
} from 'meteor/idreesia-common/constants/polls';
import {
  PollBallots,
  Polls,
  PollsActivities,
  PollsWorkspaces,
  type PollsMetadata,
  type PollsWorkspaceDocument,
} from 'meteor/idreesia-common/server/collections/polls';

import { logActivity } from './activity';
import { pollsError } from './errors';
import {
  escapeRegExp,
  normalizePage,
  normalizeText,
  normalizeTitle,
  requireUserId,
  requireWorkspace,
  validateMetadata,
  type PollsPage,
  type PollsPageOptions,
} from './internal';

export interface CreatePollsWorkspaceInput {
  name: string;
  description?: string;
  metadata?: PollsMetadata;
}

export async function createPollsWorkspace(
  input: CreatePollsWorkspaceInput,
  userId: string
): Promise<PollsWorkspaceDocument> {
  requireUserId(userId);
  const name = normalizeTitle(input.name, 'Workspace name');
  const description = normalizeText(input.description, 'Description');
  const metadata = validateMetadata(input.metadata);

  const date = new Date();
  const workspaceId = await PollsWorkspaces.insertAsync({
    name,
    ...(description ? { description } : {}),
    ...(metadata ? { metadata } : {}),
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });

  await logActivity({
    workspaceId,
    entityType: PollsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: PollsAction.WORKSPACE_CREATED,
    userId,
    details: { name },
  });
  return requireWorkspace(workspaceId);
}

export interface UpdatePollsWorkspaceInput {
  name?: string;
  /** null clears it. */
  description?: string | null;
  /** Replaces the whole object; null clears it. */
  metadata?: PollsMetadata | null;
}

export async function updatePollsWorkspace(
  workspaceId: string,
  changes: UpdatePollsWorkspaceInput,
  userId: string
): Promise<PollsWorkspaceDocument> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);

  const $set: Partial<PollsWorkspaceDocument> = {
    updatedAt: new Date(),
    updatedBy: userId,
  };
  const $unset: Record<string, 1> = {};

  if (changes.name !== undefined) {
    $set.name = normalizeTitle(changes.name, 'Workspace name');
  }
  if (changes.description !== undefined) {
    const description = normalizeText(changes.description, 'Description');
    if (description) $set.description = description;
    else $unset.description = 1;
  }
  if (changes.metadata !== undefined) {
    const metadata = validateMetadata(changes.metadata);
    if (metadata) $set.metadata = metadata;
    else $unset.metadata = 1;
  }

  await PollsWorkspaces.updateAsync(workspaceId, {
    $set,
    ...(Object.keys($unset).length ? { $unset } : {}),
  });
  await logActivity({
    workspaceId,
    entityType: PollsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: PollsAction.WORKSPACE_UPDATED,
    userId,
    details: { changed: Object.keys(changes) },
  });
  return requireWorkspace(workspaceId);
}

export async function getPollsWorkspace(
  workspaceId: string,
  userId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<PollsWorkspaceDocument> {
  requireUserId(userId);
  return requireWorkspace(workspaceId, { includeDeleted });
}

export interface ListPollsWorkspacesOptions extends PollsPageOptions {
  /** Only these workspaces - e.g. the ones the caller's feature owns. */
  workspaceIds?: string[];
  /** Case-insensitive match anywhere in the name. */
  nameContains?: string;
  includeDeleted?: boolean;
  /** Only deleted workspaces. */
  onlyDeleted?: boolean;
}

export async function listPollsWorkspaces(
  userId: string,
  {
    workspaceIds,
    nameContains,
    includeDeleted = false,
    onlyDeleted = false,
    ...page
  }: ListPollsWorkspacesOptions = {}
): Promise<PollsPage<PollsWorkspaceDocument>> {
  requireUserId(userId);
  const { skip, limit } = normalizePage(page);

  const selector: Record<string, unknown> = {};
  if (workspaceIds) selector._id = { $in: workspaceIds };
  if (nameContains?.trim()) {
    selector.name = {
      $regex: escapeRegExp(nameContains.trim()),
      $options: 'i',
    };
  }
  if (onlyDeleted) selector.deletedAt = { $exists: true };
  else if (!includeDeleted) selector.deletedAt = { $exists: false };

  const [data, totalResults] = await Promise.all([
    PollsWorkspaces.find(selector, {
      sort: { name: 1, _id: 1 },
      skip,
      limit,
    }).fetchAsync(),
    PollsWorkspaces.find(selector).countAsync(),
  ]);
  return { data, totalResults };
}

/** Soft-deletes a workspace. Its polls stay as they are until purged. */
export async function deletePollsWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  await PollsWorkspaces.updateAsync(workspaceId, {
    $set: { deletedAt: new Date(), deletedBy: userId },
  });
  await logActivity({
    workspaceId,
    entityType: PollsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: PollsAction.WORKSPACE_DELETED,
    userId,
  });
}

export async function restorePollsWorkspace(
  workspaceId: string,
  userId: string
): Promise<PollsWorkspaceDocument> {
  requireUserId(userId);
  const workspace = await requireWorkspace(workspaceId, {
    includeDeleted: true,
  });
  if (!workspace.deletedAt) {
    throw pollsError('CONFLICT', 'Workspace is not deleted');
  }
  await PollsWorkspaces.updateAsync(workspaceId, {
    $set: { updatedAt: new Date(), updatedBy: userId },
    $unset: { deletedAt: 1, deletedBy: 1 },
  });
  await logActivity({
    workspaceId,
    entityType: PollsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: PollsAction.WORKSPACE_RESTORED,
    userId,
  });
  return requireWorkspace(workspaceId);
}

/**
 * Permanently removes a deleted workspace: every poll, ballot and activity
 * entry.
 */
export async function purgePollsWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const workspace = await requireWorkspace(workspaceId, {
    includeDeleted: true,
  });
  if (!workspace.deletedAt) {
    throw pollsError(
      'CONFLICT',
      'Only a deleted workspace can be purged; delete it first'
    );
  }

  await PollBallots.removeAsync({ workspaceId });
  await Polls.removeAsync({ workspaceId });
  await PollsActivities.removeAsync({ workspaceId });
  await PollsWorkspaces.removeAsync(workspaceId);
}
