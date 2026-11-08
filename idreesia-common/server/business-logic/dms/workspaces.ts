import { DmsAction, DmsEntityType } from 'meteor/idreesia-common/constants/dms';
import {
  DmsActivities,
  DmsDocuments,
  DmsDocumentVersions,
  DmsFolders,
  DmsWorkspaces,
  type DmsMetadata,
  type DmsWorkspaceDocument,
  type DmsWorkspaceSettings,
} from 'meteor/idreesia-common/server/collections/dms';

import { logActivity } from './activity';
import { dmsError } from './errors';
import {
  deleteFilesQuietly,
  normalizeName,
  normalizePage,
  requireUserId,
  requireWorkspace,
  validateMetadata,
  type DmsPage,
  type DmsPageOptions,
} from './internal';

function validateSettings(settings: unknown): DmsWorkspaceSettings | undefined {
  if (settings === undefined || settings === null) return undefined;
  if (typeof settings !== 'object' || Array.isArray(settings)) {
    throw dmsError('BAD_USER_INPUT', 'Settings must be an object');
  }
  const { maxFileSize, allowedMimeTypes } = settings as DmsWorkspaceSettings;
  if (
    maxFileSize !== undefined &&
    (!Number.isSafeInteger(maxFileSize) || maxFileSize < 1)
  ) {
    throw dmsError('BAD_USER_INPUT', 'maxFileSize must be a positive integer');
  }
  if (
    allowedMimeTypes !== undefined &&
    (!Array.isArray(allowedMimeTypes) ||
      allowedMimeTypes.some(type => typeof type !== 'string' || !type.trim()))
  ) {
    throw dmsError(
      'BAD_USER_INPUT',
      'allowedMimeTypes must be a list of MIME types'
    );
  }
  return {
    ...(maxFileSize !== undefined ? { maxFileSize } : {}),
    ...(allowedMimeTypes !== undefined
      ? { allowedMimeTypes: allowedMimeTypes.map(t => t.trim().toLowerCase()) }
      : {}),
  };
}

const trimmedOrUndefined = (value: string | null | undefined) =>
  value?.trim() || undefined;

export interface CreateWorkspaceInput {
  name: string;
  description?: string;
  metadata?: DmsMetadata;
  settings?: DmsWorkspaceSettings;
}

export async function createWorkspace(
  input: CreateWorkspaceInput,
  userId: string
): Promise<DmsWorkspaceDocument> {
  requireUserId(userId);
  const { name } = normalizeName(input.name, 'Workspace name');
  const description = trimmedOrUndefined(input.description);
  const metadata = validateMetadata(input.metadata);
  const settings = validateSettings(input.settings);

  const date = new Date();
  const workspaceId = await DmsWorkspaces.insertAsync({
    name,
    ...(description ? { description } : {}),
    ...(metadata ? { metadata } : {}),
    ...(settings ? { settings } : {}),
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });

  await logActivity({
    workspaceId,
    entityType: DmsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: DmsAction.WORKSPACE_CREATED,
    userId,
    details: { name },
  });
  return requireWorkspace(workspaceId);
}

export interface UpdateWorkspaceInput {
  name?: string;
  /** null clears it. */
  description?: string | null;
  /** Replaces the whole object; null clears it. */
  metadata?: DmsMetadata | null;
  /** Replaces the whole object; null clears it. */
  settings?: DmsWorkspaceSettings | null;
}

export async function updateWorkspace(
  workspaceId: string,
  changes: UpdateWorkspaceInput,
  userId: string
): Promise<DmsWorkspaceDocument> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);

  const $set: Partial<DmsWorkspaceDocument> = {
    updatedAt: new Date(),
    updatedBy: userId,
  };
  const $unset: Record<string, 1> = {};

  if (changes.name !== undefined) {
    $set.name = normalizeName(changes.name, 'Workspace name').name;
  }
  if (changes.description !== undefined) {
    const description = trimmedOrUndefined(changes.description);
    if (description) $set.description = description;
    else $unset.description = 1;
  }
  if (changes.metadata !== undefined) {
    const metadata = validateMetadata(changes.metadata);
    if (metadata) $set.metadata = metadata;
    else $unset.metadata = 1;
  }
  if (changes.settings !== undefined) {
    const settings = validateSettings(changes.settings);
    if (settings) $set.settings = settings;
    else $unset.settings = 1;
  }

  await DmsWorkspaces.updateAsync(workspaceId, {
    $set,
    ...(Object.keys($unset).length ? { $unset } : {}),
  });
  await logActivity({
    workspaceId,
    entityType: DmsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: DmsAction.WORKSPACE_UPDATED,
    userId,
    details: { changed: Object.keys(changes) },
  });
  return requireWorkspace(workspaceId);
}

export async function getWorkspace(
  workspaceId: string,
  userId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<DmsWorkspaceDocument> {
  requireUserId(userId);
  return requireWorkspace(workspaceId, { includeDeleted });
}

export interface ListWorkspacesOptions extends DmsPageOptions {
  /** Only these workspaces - e.g. the ones the caller's feature owns. */
  workspaceIds?: string[];
  /** Case-insensitive match anywhere in the name. */
  nameContains?: string;
  includeDeleted?: boolean;
  /** Only deleted workspaces. */
  onlyDeleted?: boolean;
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listWorkspaces(
  userId: string,
  {
    workspaceIds,
    nameContains,
    includeDeleted = false,
    onlyDeleted = false,
    ...page
  }: ListWorkspacesOptions = {}
): Promise<DmsPage<DmsWorkspaceDocument>> {
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
    DmsWorkspaces.find(selector, {
      sort: { name: 1, _id: 1 },
      skip,
      limit,
    }).fetchAsync(),
    DmsWorkspaces.find(selector).countAsync(),
  ]);
  return { data, totalResults };
}

/** Soft-deletes a workspace. Its contents stay as they are until purged. */
export async function deleteWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  const date = new Date();
  await DmsWorkspaces.updateAsync(workspaceId, {
    $set: { deletedAt: date, deletedBy: userId },
  });
  await logActivity({
    workspaceId,
    entityType: DmsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: DmsAction.WORKSPACE_DELETED,
    userId,
  });
}

export async function restoreWorkspace(
  workspaceId: string,
  userId: string
): Promise<DmsWorkspaceDocument> {
  requireUserId(userId);
  const workspace = await requireWorkspace(workspaceId, {
    includeDeleted: true,
  });
  if (!workspace.deletedAt) {
    throw dmsError('CONFLICT', 'Workspace is not deleted');
  }
  await DmsWorkspaces.updateAsync(workspaceId, {
    $set: { updatedAt: new Date(), updatedBy: userId },
    $unset: { deletedAt: 1, deletedBy: 1 },
  });
  await logActivity({
    workspaceId,
    entityType: DmsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: DmsAction.WORKSPACE_RESTORED,
    userId,
  });
  return requireWorkspace(workspaceId);
}

/**
 * Permanently removes a deleted workspace: every folder, document, version,
 * stored file and activity entry. Locks are ignored - the whole workspace is
 * going away.
 */
export async function purgeWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const workspace = await requireWorkspace(workspaceId, {
    includeDeleted: true,
  });
  if (!workspace.deletedAt) {
    throw dmsError(
      'CONFLICT',
      'Only a deleted workspace can be purged; delete it first'
    );
  }

  const versions = await DmsDocumentVersions.find(
    { workspaceId },
    { fields: { fileKey: 1 } }
  ).fetchAsync();

  await DmsDocumentVersions.removeAsync({ workspaceId });
  await DmsDocuments.removeAsync({ workspaceId });
  await DmsFolders.removeAsync({ workspaceId });
  await DmsActivities.removeAsync({ workspaceId });
  await DmsWorkspaces.removeAsync(workspaceId);

  await deleteFilesQuietly(versions.map(({ fileKey }) => fileKey));
}
