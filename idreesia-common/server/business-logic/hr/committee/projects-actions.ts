import {
  addProjectParticipants,
  createProject,
  createTask,
  deleteProject,
  removeProjectParticipant,
  setProjectStatus,
  updateProject,
  updateTask,
  type DeleteProjectOptions,
} from 'meteor/idreesia-common/server/business-logic/projects';
import type {
  ProjectDocument,
  ProjectTaskDocument,
} from 'meteor/idreesia-common/server/collections/projects';
import type { ProjectStatusValue } from 'meteor/idreesia-common/constants/projects';

import { parseTimestamp } from './meetings-actions';
import {
  addProjectChatMembers,
  archiveProjectChat,
  removeProjectChatMember,
  syncProjectChatArchive,
  tryEnsureProjectChatGroup,
} from './projects-chat';
import type { CommitteeDoc } from './types';

/*
 * Committee-side project and task changes that take more than one projects
 * module call (keeping the project's chat group and participants in step), or
 * translate the Workspaces API's inputs (timestamps as strings of
 * milliseconds). Callers check access first.
 */

export interface CommitteeProjectInput {
  title: string;
  objective?: string | null;
  description?: string | null;
  participantIds?: string[] | null;
  startDate?: string | null;
  targetDate?: string | null;
  tags?: string[] | null;
}

export interface CommitteeTaskInput {
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  priority?: string | null;
  tags?: string[] | null;
  /** On create only: the project the task belongs to. */
  projectId?: string | null;
}

export async function createCommitteeProject(
  committee: CommitteeDoc,
  workspaceId: string,
  input: CommitteeProjectInput,
  userId: string
) {
  const project = await createProject(
    {
      workspaceId,
      title: input.title,
      objective: input.objective ?? undefined,
      description: input.description ?? undefined,
      participantIds: input.participantIds ?? [],
      startDate: parseTimestamp(input.startDate),
      targetDate: parseTimestamp(input.targetDate),
      tags: input.tags ?? [],
    },
    userId
  );
  await tryEnsureProjectChatGroup(committee, project, userId);
  return project;
}

/** Saves the edit form. Participants are handled separately. */
export async function updateCommitteeProject(
  project: ProjectDocument,
  input: CommitteeProjectInput,
  userId: string
) {
  return updateProject(
    project._id,
    {
      title: input.title,
      objective: input.objective ?? null,
      description: input.description ?? null,
      startDate: parseTimestamp(input.startDate) ?? null,
      targetDate: parseTimestamp(input.targetDate) ?? null,
      ...(input.tags ? { tags: input.tags } : {}),
    },
    userId
  );
}

/** Changes the status, archiving or reopening the chat group to match. */
export async function setCommitteeProjectStatus(
  projectId: string,
  status: ProjectStatusValue,
  force: boolean,
  userId: string
) {
  const project = await setProjectStatus(projectId, status, userId, { force });
  await syncProjectChatArchive(project);
  return project;
}

/** Archives the chat group (its history is kept), then deletes the project. */
export async function deleteCommitteeProject(
  project: ProjectDocument,
  options: DeleteProjectOptions,
  userId: string
) {
  await archiveProjectChat(project);
  await deleteProject(project._id, userId, options);
}

/** Adds participants and gives them access to the project's chat. */
export async function addCommitteeProjectParticipants(
  project: ProjectDocument,
  personIds: string[],
  userId: string
) {
  const added = personIds.filter(id => !project.participantIds.includes(id));
  if (!added.length) return project;
  // Chat first, so a chat failure leaves the project unchanged.
  await addProjectChatMembers(project, added);
  return addProjectParticipants(project._id, added, userId);
}

/** Removes a participant and their access to the project's chat. */
export async function removeCommitteeProjectParticipant(
  project: ProjectDocument,
  personId: string,
  unassignTasks: boolean,
  userId: string
) {
  // The module refuses to remove a person with open tasks; make sure it
  // will accept before touching chat.
  const updated = await removeProjectParticipant(project._id, personId, userId, {
    unassignTasks,
  });
  await removeProjectChatMember(project, personId);
  return updated;
}

/** A project task can only go to a participant: make the assignee one. */
async function ensureParticipant(
  project: ProjectDocument | undefined,
  assigneeId: string | null | undefined,
  userId: string
) {
  if (project && assigneeId && !project.participantIds.includes(assigneeId)) {
    await addCommitteeProjectParticipants(project, [assigneeId], userId);
  }
}

export async function createCommitteeTask(
  workspaceId: string,
  project: ProjectDocument | undefined,
  input: CommitteeTaskInput,
  userId: string
) {
  await ensureParticipant(project, input.assigneeId, userId);
  return createTask(
    {
      workspaceId,
      projectId: project?._id,
      title: input.title,
      description: input.description ?? undefined,
      assigneeId: input.assigneeId || undefined,
      dueDate: parseTimestamp(input.dueDate),
      priority: (input.priority as never) || undefined,
      tags: input.tags ?? [],
    },
    userId
  );
}

/** Saves the full edit form (coordinators). */
export async function updateCommitteeTask(
  task: ProjectTaskDocument,
  project: ProjectDocument | undefined,
  input: CommitteeTaskInput,
  userId: string
) {
  await ensureParticipant(project, input.assigneeId, userId);
  return updateTask(
    task._id,
    {
      title: input.title,
      description: input.description ?? null,
      assigneeId: input.assigneeId || null,
      dueDate: parseTimestamp(input.dueDate) ?? null,
      ...(input.priority ? { priority: input.priority as never } : {}),
      ...(input.tags ? { tags: input.tags } : {}),
    },
    userId
  );
}
