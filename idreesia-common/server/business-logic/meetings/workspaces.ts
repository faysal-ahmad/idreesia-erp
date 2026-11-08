import {
  MeetingsAction,
  MeetingsEntityType,
} from 'meteor/idreesia-common/constants/meetings';
import {
  MeetingActionItems,
  MeetingAttachments,
  Meetings,
  MeetingsActivities,
  MeetingsWorkspaces,
  type MeetingsMetadata,
  type MeetingsWorkspaceDocument,
  type MeetingsWorkspaceSettings,
} from 'meteor/idreesia-common/server/collections/meetings';

import { logActivity } from './activity';
import { meetingsError } from './errors';
import {
  deleteFilesQuietly,
  escapeRegExp,
  normalizePage,
  normalizeText,
  normalizeTitle,
  requireUserId,
  requireWorkspace,
  validateMetadata,
  type MeetingsPage,
  type MeetingsPageOptions,
} from './internal';

function validateSettings(
  settings: unknown
): MeetingsWorkspaceSettings | undefined {
  if (settings === undefined || settings === null) return undefined;
  if (typeof settings !== 'object' || Array.isArray(settings)) {
    throw meetingsError('BAD_USER_INPUT', 'Settings must be an object');
  }
  const { maxFileSize, allowedMimeTypes } =
    settings as MeetingsWorkspaceSettings;
  if (
    maxFileSize !== undefined &&
    (!Number.isSafeInteger(maxFileSize) || maxFileSize < 1)
  ) {
    throw meetingsError(
      'BAD_USER_INPUT',
      'maxFileSize must be a positive integer'
    );
  }
  if (
    allowedMimeTypes !== undefined &&
    (!Array.isArray(allowedMimeTypes) ||
      allowedMimeTypes.some(type => typeof type !== 'string' || !type.trim()))
  ) {
    throw meetingsError(
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

export interface CreateMeetingsWorkspaceInput {
  name: string;
  description?: string;
  metadata?: MeetingsMetadata;
  settings?: MeetingsWorkspaceSettings;
}

export async function createMeetingsWorkspace(
  input: CreateMeetingsWorkspaceInput,
  userId: string
): Promise<MeetingsWorkspaceDocument> {
  requireUserId(userId);
  const name = normalizeTitle(input.name, 'Workspace name');
  const description = normalizeText(input.description, 'Description');
  const metadata = validateMetadata(input.metadata);
  const settings = validateSettings(input.settings);

  const date = new Date();
  const workspaceId = await MeetingsWorkspaces.insertAsync({
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
    entityType: MeetingsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: MeetingsAction.WORKSPACE_CREATED,
    userId,
    details: { name },
  });
  return requireWorkspace(workspaceId);
}

export interface UpdateMeetingsWorkspaceInput {
  name?: string;
  /** null clears it. */
  description?: string | null;
  /** Replaces the whole object; null clears it. */
  metadata?: MeetingsMetadata | null;
  /** Replaces the whole object; null clears it. */
  settings?: MeetingsWorkspaceSettings | null;
}

export async function updateMeetingsWorkspace(
  workspaceId: string,
  changes: UpdateMeetingsWorkspaceInput,
  userId: string
): Promise<MeetingsWorkspaceDocument> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);

  const $set: Partial<MeetingsWorkspaceDocument> = {
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
  if (changes.settings !== undefined) {
    const settings = validateSettings(changes.settings);
    if (settings) $set.settings = settings;
    else $unset.settings = 1;
  }

  await MeetingsWorkspaces.updateAsync(workspaceId, {
    $set,
    ...(Object.keys($unset).length ? { $unset } : {}),
  });
  await logActivity({
    workspaceId,
    entityType: MeetingsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: MeetingsAction.WORKSPACE_UPDATED,
    userId,
    details: { changed: Object.keys(changes) },
  });
  return requireWorkspace(workspaceId);
}

export async function getMeetingsWorkspace(
  workspaceId: string,
  userId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<MeetingsWorkspaceDocument> {
  requireUserId(userId);
  return requireWorkspace(workspaceId, { includeDeleted });
}

export interface ListMeetingsWorkspacesOptions extends MeetingsPageOptions {
  /** Only these workspaces - e.g. the ones the caller's feature owns. */
  workspaceIds?: string[];
  /** Case-insensitive match anywhere in the name. */
  nameContains?: string;
  includeDeleted?: boolean;
  /** Only deleted workspaces. */
  onlyDeleted?: boolean;
}

export async function listMeetingsWorkspaces(
  userId: string,
  {
    workspaceIds,
    nameContains,
    includeDeleted = false,
    onlyDeleted = false,
    ...page
  }: ListMeetingsWorkspacesOptions = {}
): Promise<MeetingsPage<MeetingsWorkspaceDocument>> {
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
    MeetingsWorkspaces.find(selector, {
      sort: { name: 1, _id: 1 },
      skip,
      limit,
    }).fetchAsync(),
    MeetingsWorkspaces.find(selector).countAsync(),
  ]);
  return { data, totalResults };
}

/** Soft-deletes a workspace. Its contents stay as they are until purged. */
export async function deleteMeetingsWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  await MeetingsWorkspaces.updateAsync(workspaceId, {
    $set: { deletedAt: new Date(), deletedBy: userId },
  });
  await logActivity({
    workspaceId,
    entityType: MeetingsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: MeetingsAction.WORKSPACE_DELETED,
    userId,
  });
}

export async function restoreMeetingsWorkspace(
  workspaceId: string,
  userId: string
): Promise<MeetingsWorkspaceDocument> {
  requireUserId(userId);
  const workspace = await requireWorkspace(workspaceId, {
    includeDeleted: true,
  });
  if (!workspace.deletedAt) {
    throw meetingsError('CONFLICT', 'Workspace is not deleted');
  }
  await MeetingsWorkspaces.updateAsync(workspaceId, {
    $set: { updatedAt: new Date(), updatedBy: userId },
    $unset: { deletedAt: 1, deletedBy: 1 },
  });
  await logActivity({
    workspaceId,
    entityType: MeetingsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: MeetingsAction.WORKSPACE_RESTORED,
    userId,
  });
  return requireWorkspace(workspaceId);
}

/**
 * Permanently removes a deleted workspace: every meeting, action item,
 * attachment (with its stored file) and activity entry.
 */
export async function purgeMeetingsWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const workspace = await requireWorkspace(workspaceId, {
    includeDeleted: true,
  });
  if (!workspace.deletedAt) {
    throw meetingsError(
      'CONFLICT',
      'Only a deleted workspace can be purged; delete it first'
    );
  }

  const attachments = await MeetingAttachments.find(
    { workspaceId },
    { fields: { fileKey: 1 } }
  ).fetchAsync();

  await MeetingAttachments.removeAsync({ workspaceId });
  await MeetingActionItems.removeAsync({ workspaceId });
  await Meetings.removeAsync({ workspaceId });
  await MeetingsActivities.removeAsync({ workspaceId });
  await MeetingsWorkspaces.removeAsync(workspaceId);

  await deleteFilesQuietly(attachments.map(({ fileKey }) => fileKey));
}
