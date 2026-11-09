import {
  PROJECTS_MAX_COMMENT_LENGTH,
  ProjectsAction,
  ProjectsEntityType,
} from 'meteor/idreesia-common/constants/projects';
import {
  ProjectComments,
  ProjectTasks,
  type ProjectCommentDocument,
} from 'meteor/idreesia-common/server/collections/projects';

import { logActivity } from './activity';
import { projectsError } from './errors';
import {
  normalizePage,
  normalizeText,
  requireTask,
  requireUserId,
  type ProjectsPage,
  type ProjectsPageOptions,
} from './internal';

/** Adds a comment to a task. The acting user is the author. */
export async function addTaskComment(
  taskId: string,
  text: string,
  userId: string
): Promise<ProjectCommentDocument> {
  requireUserId(userId);
  const task = await requireTask(taskId);
  const value = normalizeText(text, 'Comment', PROJECTS_MAX_COMMENT_LENGTH);
  if (!value) throw projectsError('BAD_USER_INPUT', 'Comment is required');

  const date = new Date();
  const commentId = await ProjectComments.insertAsync({
    workspaceId: task.workspaceId,
    taskId,
    authorId: userId,
    text: value,
    createdAt: date,
    createdBy: userId,
    updatedAt: date,
    updatedBy: userId,
  });
  await ProjectTasks.updateAsync(taskId, { $inc: { commentCount: 1 } });
  await logActivity({
    workspaceId: task.workspaceId,
    ...(task.projectId ? { projectId: task.projectId } : {}),
    taskId,
    entityType: ProjectsEntityType.COMMENT,
    entityId: commentId,
    action: ProjectsAction.COMMENT_ADDED,
    userId,
  });
  return (await ProjectComments.findOneAsync(commentId))!;
}

export async function getTaskComment(
  commentId: string,
  userId: string
): Promise<ProjectCommentDocument> {
  requireUserId(userId);
  const comment = commentId
    ? await ProjectComments.findOneAsync(commentId)
    : undefined;
  if (!comment) throw projectsError('NOT_FOUND', 'Comment not found');
  await requireTask(comment.taskId).catch(() => {
    throw projectsError('NOT_FOUND', 'Comment not found');
  });
  return comment;
}

/** Deletes a comment. The caller decides who may delete whose comment. */
export async function deleteTaskComment(
  commentId: string,
  userId: string
): Promise<void> {
  const comment = await getTaskComment(commentId, userId);
  const task = await requireTask(comment.taskId);
  await ProjectComments.removeAsync(commentId);
  await ProjectTasks.updateAsync(
    { _id: task._id, commentCount: { $gt: 0 } },
    { $inc: { commentCount: -1 } }
  );
  await logActivity({
    workspaceId: task.workspaceId,
    ...(task.projectId ? { projectId: task.projectId } : {}),
    taskId: task._id,
    entityType: ProjectsEntityType.COMMENT,
    entityId: commentId,
    action: ProjectsAction.COMMENT_DELETED,
    userId,
  });
}

/** A task's comments, oldest first. */
export async function listTaskComments(
  taskId: string,
  userId: string,
  page: ProjectsPageOptions = {}
): Promise<ProjectsPage<ProjectCommentDocument>> {
  requireUserId(userId);
  await requireTask(taskId);
  const { skip, limit } = normalizePage(page);
  const [data, totalResults] = await Promise.all([
    ProjectComments.find(
      { taskId },
      { sort: { createdAt: 1, _id: 1 }, skip, limit }
    ).fetchAsync(),
    ProjectComments.find({ taskId }).countAsync(),
  ]);
  return { data, totalResults };
}
