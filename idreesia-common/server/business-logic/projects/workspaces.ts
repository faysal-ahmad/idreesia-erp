import {
  ProjectsAction,
  ProjectsEntityType,
} from 'meteor/idreesia-common/constants/projects';
import {
  ProjectComments,
  Projects,
  ProjectTasks,
  ProjectsActivities,
  ProjectsWorkspaces,
  type ProjectsMetadata,
  type ProjectsWorkspaceDocument,
} from 'meteor/idreesia-common/server/collections/projects';

import { logActivity } from './activity';
import { projectsError } from './errors';
import {
  escapeRegExp,
  normalizePage,
  normalizeText,
  normalizeTitle,
  requireUserId,
  requireWorkspace,
  validateMetadata,
  type ProjectsPage,
  type ProjectsPageOptions,
} from './internal';

export interface CreateProjectsWorkspaceInput {
  name: string;
  description?: string;
  metadata?: ProjectsMetadata;
}

export async function createProjectsWorkspace(
  input: CreateProjectsWorkspaceInput,
  userId: string
): Promise<ProjectsWorkspaceDocument> {
  requireUserId(userId);
  const name = normalizeTitle(input.name, 'Workspace name');
  const description = normalizeText(input.description, 'Description');
  const metadata = validateMetadata(input.metadata);

  const date = new Date();
  const workspaceId = await ProjectsWorkspaces.insertAsync({
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
    entityType: ProjectsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: ProjectsAction.WORKSPACE_CREATED,
    userId,
    details: { name },
  });
  return requireWorkspace(workspaceId);
}

export interface UpdateProjectsWorkspaceInput {
  name?: string;
  /** null clears it. */
  description?: string | null;
  /** Replaces the whole object; null clears it. */
  metadata?: ProjectsMetadata | null;
}

export async function updateProjectsWorkspace(
  workspaceId: string,
  changes: UpdateProjectsWorkspaceInput,
  userId: string
): Promise<ProjectsWorkspaceDocument> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);

  const $set: Partial<ProjectsWorkspaceDocument> = {
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

  await ProjectsWorkspaces.updateAsync(workspaceId, {
    $set,
    ...(Object.keys($unset).length ? { $unset } : {}),
  });
  await logActivity({
    workspaceId,
    entityType: ProjectsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: ProjectsAction.WORKSPACE_UPDATED,
    userId,
    details: { changed: Object.keys(changes) },
  });
  return requireWorkspace(workspaceId);
}

export async function getProjectsWorkspace(
  workspaceId: string,
  userId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<ProjectsWorkspaceDocument> {
  requireUserId(userId);
  return requireWorkspace(workspaceId, { includeDeleted });
}

export interface ListProjectsWorkspacesOptions extends ProjectsPageOptions {
  /** Only these workspaces - e.g. the ones the caller's feature owns. */
  workspaceIds?: string[];
  /** Case-insensitive match anywhere in the name. */
  nameContains?: string;
  includeDeleted?: boolean;
  /** Only deleted workspaces. */
  onlyDeleted?: boolean;
}

export async function listProjectsWorkspaces(
  userId: string,
  {
    workspaceIds,
    nameContains,
    includeDeleted = false,
    onlyDeleted = false,
    ...page
  }: ListProjectsWorkspacesOptions = {}
): Promise<ProjectsPage<ProjectsWorkspaceDocument>> {
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
    ProjectsWorkspaces.find(selector, {
      sort: { name: 1, _id: 1 },
      skip,
      limit,
    }).fetchAsync(),
    ProjectsWorkspaces.find(selector).countAsync(),
  ]);
  return { data, totalResults };
}

/** Soft-deletes a workspace. Its projects and tasks stay as they are until purged. */
export async function deleteProjectsWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  await ProjectsWorkspaces.updateAsync(workspaceId, {
    $set: { deletedAt: new Date(), deletedBy: userId },
  });
  await logActivity({
    workspaceId,
    entityType: ProjectsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: ProjectsAction.WORKSPACE_DELETED,
    userId,
  });
}

export async function restoreProjectsWorkspace(
  workspaceId: string,
  userId: string
): Promise<ProjectsWorkspaceDocument> {
  requireUserId(userId);
  const workspace = await requireWorkspace(workspaceId, {
    includeDeleted: true,
  });
  if (!workspace.deletedAt) {
    throw projectsError('CONFLICT', 'Workspace is not deleted');
  }
  await ProjectsWorkspaces.updateAsync(workspaceId, {
    $set: { updatedAt: new Date(), updatedBy: userId },
    $unset: { deletedAt: 1, deletedBy: 1 },
  });
  await logActivity({
    workspaceId,
    entityType: ProjectsEntityType.WORKSPACE,
    entityId: workspaceId,
    action: ProjectsAction.WORKSPACE_RESTORED,
    userId,
  });
  return requireWorkspace(workspaceId);
}

/**
 * Permanently removes a deleted workspace: every project, task, comment and activity
 * entry.
 */
export async function purgeProjectsWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const workspace = await requireWorkspace(workspaceId, {
    includeDeleted: true,
  });
  if (!workspace.deletedAt) {
    throw projectsError(
      'CONFLICT',
      'Only a deleted workspace can be purged; delete it first'
    );
  }

  await ProjectComments.removeAsync({ workspaceId });
  await ProjectTasks.removeAsync({ workspaceId });
  await Projects.removeAsync({ workspaceId });
  await ProjectsActivities.removeAsync({ workspaceId });
  await ProjectsWorkspaces.removeAsync(workspaceId);
}
