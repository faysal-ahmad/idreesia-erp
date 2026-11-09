import {
  OpenProjectStatuses,
  OpenTaskStatuses,
  ProjectStatus,
  TaskStatus,
  type ProjectStatusValue,
  type TaskStatusValue,
} from 'meteor/idreesia-common/constants/projects';
import {
  getProject,
  getTask,
  isTaskOverdue,
  listProjects,
  listProjectsActivity,
  listTaskComments,
  listTasks,
} from 'meteor/idreesia-common/server/business-logic/projects';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Projects,
  type ProjectCommentDocument,
  type ProjectDocument,
  type ProjectsActivityDocument,
  type ProjectTaskDocument,
} from 'meteor/idreesia-common/server/collections/projects';

import { getUserNames } from './documents-library';
import type { ViewContext } from './meetings-view';
import type { CommitteeDoc } from './types';

/*
 * A committee's projects and tasks, as the Workspaces feature shows them: the
 * projects module's records with member and user names instead of ids, and
 * timestamps as strings of milliseconds. Participants and assignees
 * are committee members (karkun ids). Callers check that the user may use the
 * committee's projects (and that the ids belong to its workspace) first.
 */

/** What the view functions need to know about the acting user. */
export interface ProjectsContext extends ViewContext {
  committee: CommitteeDoc;
  /** The committee's projects workspace. */
  workspaceId: string;
}

type Names = Map<string, string>;

const timestamp = (date?: Date) => (date ? String(date.getTime()) : null);
const nameOf = (names: Names, id?: string | null) =>
  (id && names.get(id)) || null;

/** Names of karkuns (committee members), by their person id. */
async function getPersonNames(
  personIds: Array<string | null | undefined>
): Promise<Names> {
  const ids = [...new Set(personIds.filter((id): id is string => !!id))];
  if (!ids.length) return new Map();
  const people = (await People.find(
    { _id: { $in: ids } },
    { fields: { _id: 1, 'sharedData.name': 1 } }
  ).fetchAsync()) as Array<{ _id: string; sharedData?: { name?: string } }>;
  return new Map(
    people
      .filter(person => person.sharedData?.name)
      .map(person => [person._id, person.sharedData!.name!])
  );
}

const byName = <T extends { name: string | null }>(a: T, b: T) =>
  (a.name ?? '').localeCompare(b.name ?? '');

const toPage = (pageIndex?: number | null, pageSize?: number | null) => {
  const limit = pageSize ?? 20;
  return { skip: (pageIndex ?? 0) * limit, limit };
};

// ---------------------------------------------------------------------------
// Info and members
// ---------------------------------------------------------------------------

export function getCommitteeProjectsInfo(context: ViewContext) {
  return {
    // Coordinators create projects and standalone tasks.
    canManage: context.isCoordinator,
    myPersonId: context.personId,
  };
}

/** The committee's members, who can own or take part in projects, by name. */
export async function getCommitteeProjectMembers(committee: CommitteeDoc) {
  const members = committee.members ?? [];
  const names = await getPersonNames(members.map(({ karkunId }) => karkunId));
  return members
    .map(member => ({
      personId: member.karkunId,
      name: names.get(member.karkunId) ?? null,
      isCoordinator: !!member.isCoordinator,
    }))
    .sort(byName);
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

function toProject(
  project: ProjectDocument,
  people: Names,
  users: Names,
  context: ViewContext
) {
  const isOpen = OpenProjectStatuses.includes(project.status);
  return {
    _id: project._id,
    title: project.title,
    objective: project.objective ?? null,
    description: project.description ?? null,
    status: project.status,
    participants: project.participantIds
      .map(personId => ({ personId, name: nameOf(people, personId) }))
      .sort(byName),
    participantCount: project.participantIds.length,
    isParticipant:
      !!context.personId && project.participantIds.includes(context.personId),
    canManage: context.isCoordinator,
    startDate: timestamp(project.startDate),
    targetDate: timestamp(project.targetDate),
    isOverdue:
      isOpen &&
      !!project.targetDate &&
      project.targetDate.getTime() < Date.now(),
    taskCount: project.taskCount,
    doneCount: project.doneCount,
    openTaskCount: project.taskCount - project.doneCount,
    progress: project.progress,
    tags: project.tags,
    completedAt: timestamp(project.completedAt),
    completedByName: nameOf(users, project.completedBy),
    createdAt: timestamp(project.createdAt),
    createdByName: nameOf(users, project.createdBy),
    updatedAt: timestamp(project.updatedAt),
    updatedByName: nameOf(users, project.updatedBy),
  };
}

async function mapProjects(projects: ProjectDocument[], context: ViewContext) {
  const [people, users] = await Promise.all([
    getPersonNames(
      projects.flatMap(({ participantIds }) => participantIds)
    ),
    getUserNames(
      projects.flatMap(({ createdBy, updatedBy, completedBy }) => [
        createdBy,
        updatedBy,
        completedBy,
      ])
    ),
  ]);
  return projects.map(project => toProject(project, people, users, context));
}

export async function toCommitteeProject(
  project: ProjectDocument,
  context: ViewContext
) {
  return (await mapProjects([project], context))[0];
}

export async function getCommitteeProject(
  projectId: string,
  context: ViewContext
) {
  return toCommitteeProject(await getProject(projectId, context.userId), context);
}

/** Which projects a list shows. */
export type ProjectsView = 'active' | 'completed' | 'mine' | 'all';

export interface CommitteeProjectsOptions {
  view?: ProjectsView | null;
  text?: string | null;
  pageIndex?: number | null;
  pageSize?: number | null;
}

/**
 * - active: planned, active and on-hold projects, newest first
 * - completed: completed and cancelled projects, latest first
 * - mine: open projects the user takes part in
 * - all: every project, newest first
 */
export async function listCommitteeProjects(
  workspaceId: string,
  context: ViewContext,
  { view, text, pageIndex, pageSize }: CommitteeProjectsOptions
) {
  let status: ProjectStatusValue[] | undefined;
  let participantId: string | undefined;
  switch (view ?? 'active') {
    case 'active':
      status = OpenProjectStatuses;
      break;
    case 'completed':
      status = [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED];
      break;
    case 'mine':
      if (!context.personId) return { data: [], totalResults: 0 };
      status = OpenProjectStatuses;
      participantId = context.personId;
      break;
    default:
      break;
  }
  const page = await listProjects(workspaceId, context.userId, {
    status,
    participantId,
    text: text?.trim() || undefined,
    ...toPage(pageIndex, pageSize),
  });
  return {
    data: await mapProjects(page.data, context),
    totalResults: page.totalResults,
  };
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

function toTask(
  task: ProjectTaskDocument,
  projects: Map<string, ProjectDocument>,
  people: Names,
  users: Names,
  context: ViewContext
) {
  const project = task.projectId ? projects.get(task.projectId) : undefined;
  const manages = context.isCoordinator;
  const projectOpen = !project || OpenProjectStatuses.includes(project.status);
  return {
    _id: task._id,
    projectId: task.projectId ?? null,
    projectTitle: project?.title ?? null,
    title: task.title,
    description: task.description ?? null,
    assigneeId: task.assigneeId ?? null,
    assigneeName: nameOf(people, task.assigneeId),
    dueDate: timestamp(task.dueDate),
    status: task.status,
    priority: task.priority,
    progress: task.progress,
    isOverdue: isTaskOverdue(task),
    tags: task.tags,
    commentCount: task.commentCount,
    // Coordinators edit everything; the assignee updates
    // the status and progress of their own task. Tasks of closed projects are
    // read-only.
    canManage: manages && projectOpen,
    canUpdate:
      projectOpen &&
      (manages ||
        (!!context.personId && task.assigneeId === context.personId)),
    completedAt: timestamp(task.completedAt),
    completedByName: nameOf(users, task.completedBy),
    createdAt: timestamp(task.createdAt),
    createdByName: nameOf(users, task.createdBy),
    updatedAt: timestamp(task.updatedAt),
    updatedByName: nameOf(users, task.updatedBy),
  };
}

async function mapTasks(tasks: ProjectTaskDocument[], context: ViewContext) {
  const projectIds = [
    ...new Set(
      tasks.map(({ projectId }) => projectId).filter((id): id is string => !!id)
    ),
  ];
  const [projectDocs, people, users] = await Promise.all([
    projectIds.length
      ? Projects.find({ _id: { $in: projectIds } }).fetchAsync()
      : [],
    getPersonNames(tasks.map(({ assigneeId }) => assigneeId)),
    getUserNames(
      tasks.flatMap(({ createdBy, updatedBy, completedBy }) => [
        createdBy,
        updatedBy,
        completedBy,
      ])
    ),
  ]);
  const projects = new Map(projectDocs.map(project => [project._id, project]));
  return tasks.map(task => toTask(task, projects, people, users, context));
}

export async function toCommitteeTask(
  task: ProjectTaskDocument,
  context: ViewContext
) {
  return (await mapTasks([task], context))[0];
}

export async function getCommitteeTask(taskId: string, context: ViewContext) {
  return toCommitteeTask(await getTask(taskId, context.userId), context);
}

/** Which tasks a list shows. */
export type TasksView = 'open' | 'mine' | 'overdue' | 'done' | 'all';

export interface CommitteeTasksOptions {
  view?: TasksView | null;
  /** Only this project's tasks. */
  projectId?: string | null;
  /** Only tasks that are not part of a project. */
  standalone?: boolean | null;
  assigneeId?: string | null;
  priority?: string | null;
  text?: string | null;
  pageIndex?: number | null;
  pageSize?: number | null;
}

/**
 * - open: tasks that need work, due soonest first (no due date last)
 * - mine: the user's own open tasks, due soonest first
 * - overdue: open tasks past their due date, most overdue first
 * - done: done and cancelled tasks, latest first
 * - all: every task, newest first
 */
export async function listCommitteeTasks(
  workspaceId: string,
  context: ViewContext,
  {
    view,
    projectId,
    standalone,
    assigneeId,
    priority,
    text,
    pageIndex,
    pageSize,
  }: CommitteeTasksOptions
) {
  let status: TaskStatusValue[] | undefined;
  let overdue = false;
  let sortBy: 'dueDate' | 'createdAt' = 'dueDate';
  let mine: string | undefined;

  switch (view ?? 'open') {
    case 'open':
      status = OpenTaskStatuses;
      break;
    case 'mine':
      if (!context.personId) return { data: [], totalResults: 0 };
      status = OpenTaskStatuses;
      mine = context.personId;
      break;
    case 'overdue':
      overdue = true;
      break;
    case 'done':
      status = [TaskStatus.DONE, TaskStatus.CANCELLED];
      sortBy = 'createdAt';
      break;
    default:
      sortBy = 'createdAt';
      break;
  }

  const page = await listTasks(workspaceId, context.userId, {
    status,
    overdue,
    sortBy,
    projectId: projectId || undefined,
    standalone: standalone || undefined,
    assigneeId: mine ?? (assigneeId || undefined),
    priority: (priority as never) || undefined,
    text: text?.trim() || undefined,
    ...toPage(pageIndex, pageSize),
  });
  return {
    data: await mapTasks(page.data, context),
    totalResults: page.totalResults,
  };
}

// ---------------------------------------------------------------------------
// Comments and activity
// ---------------------------------------------------------------------------

export async function listCommitteeTaskComments(
  taskId: string,
  context: ViewContext,
  { pageIndex, pageSize }: { pageIndex?: number | null; pageSize?: number | null }
) {
  const page = await listTaskComments(taskId, context.userId, {
    ...toPage(pageIndex, pageSize ?? 50),
  });
  return {
    data: await mapComments(page.data, context),
    totalResults: page.totalResults,
  };
}

export async function mapComments(
  comments: ProjectCommentDocument[],
  context: ViewContext
) {
  const users = await getUserNames(comments.map(({ authorId }) => authorId));
  return comments.map(comment => ({
    _id: comment._id,
    taskId: comment.taskId,
    text: comment.text,
    authorName: nameOf(users, comment.authorId),
    isOwn: comment.authorId === context.userId,
    canDelete: context.isCoordinator || comment.authorId === context.userId,
    createdAt: timestamp(comment.createdAt),
  }));
}

export async function getCommitteeProjectsActivity(
  workspaceId: string,
  context: ViewContext,
  {
    projectId,
    taskId,
    before,
    limit,
  }: {
    projectId?: string | null;
    taskId?: string | null;
    before?: string | null;
    limit?: number | null;
  }
) {
  const entries: ProjectsActivityDocument[] = await listProjectsActivity(
    workspaceId,
    context.userId,
    {
      projectId: projectId || undefined,
      taskId: taskId || undefined,
      before: before ? new Date(Number(before)) : undefined,
      limit: limit ?? 50,
    }
  );
  const users = await getUserNames(entries.map(({ userId }) => userId));
  return entries.map(entry => ({
    _id: entry._id,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    projectId: entry.projectId ?? null,
    taskId: entry.taskId ?? null,
    userName: nameOf(users, entry.userId),
    at: timestamp(entry.at),
    details: entry.details ? JSON.stringify(entry.details) : null,
  }));
}
