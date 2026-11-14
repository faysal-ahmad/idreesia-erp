import {
  ProjectsActivities,
  type ProjectsActivityDocument,
} from 'meteor/idreesia-common/server/collections/projects';

import { normalizePage, requireUserId, requireWorkspace } from './internal';

/**
 * Records a change in the workspace's activity log. Logging never fails the
 * change it records: errors are only reported. Entries never hold comment
 * text.
 */
export async function logActivity(
  entry: Omit<ProjectsActivityDocument, '_id' | 'at'>
): Promise<void> {
  try {
    await ProjectsActivities.insertAsync({ ...entry, at: new Date() });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[projects] Could not log activity', entry, error);
  }
}

export interface ListProjectsActivityOptions {
  /** Only activity on this project and its tasks. */
  projectId?: string;
  /** Only activity on this task and its comments. */
  taskId?: string;
  /** Only activity before this time, for paging back through the log. */
  before?: Date;
  limit?: number;
}

/** A workspace's activity, newest first. */
export async function listProjectsActivity(
  workspaceId: string,
  userId: string,
  { projectId, taskId, before, limit }: ListProjectsActivityOptions = {}
): Promise<ProjectsActivityDocument[]> {
  requireUserId(userId);
  await requireWorkspace(workspaceId, { includeDeleted: true });

  const selector: Record<string, unknown> = { workspaceId };
  if (projectId) selector.projectId = projectId;
  if (taskId) selector.taskId = taskId;
  if (before) selector.at = { $lt: before };

  return ProjectsActivities.find(selector, {
    sort: { at: -1, _id: -1 },
    limit: normalizePage({ limit }).limit,
  }).fetchAsync();
}
