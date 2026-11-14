import { beforeEach, describe, expect, it } from 'vitest';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import Notifications from 'meteor/idreesia-common/server/collections/common/notifications';
import Committees from 'meteor/idreesia-common/server/collections/hr/committees';

import {
  buildAddedToProjectNotification,
  buildProjectStatusNotification,
  buildTaskAssignedNotification,
  buildTaskCommentNotification,
} from './notifications';
import {
  addProjectParticipants,
  addTaskComment,
  createProject,
  deleteProject,
  deleteTask,
  removeProjectParticipant,
  setTaskProgress,
  setTaskStatus,
  updateProject,
  createProjectsWorkspace,
  createTask,
  setProjectStatus,
  updateTask,
} from './index';

const projectNotifications = async () =>
  (await Notifications.find({ module: 'projects' }).fetchAsync()) as any[];

const ofType = async (eventType: string) =>
  (await projectNotifications()).filter(n => n.eventType === eventType);

let workspaceId: string;

beforeEach(async () => {
  // u1 acts; u2 and u3 are other people; p4 has no ERP user.
  await Users.insertAsync({ _id: 'u1', personId: 'p1' } as any);
  await Users.insertAsync({ _id: 'u2', personId: 'p2' } as any);
  await Users.insertAsync({ _id: 'u3', personId: 'p3' } as any);
  workspaceId = (await createProjectsWorkspace({ name: 'W' }, 'u1'))._id;
  await Committees.insertAsync({
    _id: 'c1',
    name: 'Committee',
    members: [],
    projectsWorkspaceId: workspaceId,
  } as any);
});

const newProject = (participantIds: string[] = ['p1', 'p2', 'p3']) =>
  createProject({ workspaceId, title: 'Roof repair', participantIds }, 'u1');

describe('project notifications', () => {
  it('tells participants they were added to a new project, except the creator and people without a user', async () => {
    const project = await newProject(['p1', 'p2', 'p4']);

    const all = await projectNotifications();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({
      recipientUserId: 'u2',
      actorUserId: 'u1',
      entityType: 'project',
      entityId: project._id,
      eventType: 'participants-added',
    });
  });

  it('tells only the newly added participants', async () => {
    const project = await newProject(['p1', 'p2']);
    await addProjectParticipants(project._id, ['p2', 'p3'], 'u1');

    const added = await ofType('participants-added');
    expect(added.map(n => n.recipientUserId).sort()).toEqual(['u2', 'u3']);
  });

  it('tells participants when the status changes, as one notification per person', async () => {
    const project = await newProject(['p1', 'p2']);
    await setProjectStatus(project._id, 'on-hold', 'u1');
    await setProjectStatus(project._id, 'completed', 'u1');

    const changed = await ofType('project-status-changed');
    expect(changed).toHaveLength(1);
    expect(changed[0]).toMatchObject({
      recipientUserId: 'u2',
      eventDetails: 'The project "Roof repair" is now completed.',
    });
  });

  it('sends nothing when the status does not change', async () => {
    const project = await newProject(['p1', 'p2']);
    await setProjectStatus(project._id, 'active', 'u1');
    expect(await ofType('project-status-changed')).toHaveLength(0);
  });
});

describe('task notifications', () => {
  it('tells the assignee when a task is created for them', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');

    const all = await ofType('task-assigned');
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({
      recipientUserId: 'u2',
      entityType: 'task',
      entityId: task._id,
    });
  });

  it('does not notify someone who assigns a task to themselves, or an unassigned task', async () => {
    await createTask({ workspaceId, title: 'Mine', assigneeId: 'p1' }, 'u1');
    await createTask({ workspaceId, title: 'Nobody' }, 'u1');
    expect(await projectNotifications()).toHaveLength(0);
  });

  it('tells the new assignee on reassignment, not on other edits or unassigning', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await updateTask(task._id, { title: 'Buy more tiles' }, 'u1');
    expect(await ofType('task-assigned')).toHaveLength(1);

    await updateTask(task._id, { assigneeId: 'p3' }, 'u1');
    expect((await ofType('task-assigned')).map(n => n.recipientUserId).sort()).toEqual([
      'u2',
      'u3',
    ]);

    await updateTask(task._id, { assigneeId: null }, 'u1');
    expect(await ofType('task-assigned')).toHaveLength(2);
  });

  it('tells the assignee about a comment from someone else, not their own', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await Notifications.removeAsync({});

    await addTaskComment(task._id, 'Any update?', 'u1');
    await addTaskComment(task._id, 'Working on it', 'u2');

    const comments = await ofType('comment-added');
    expect(comments).toHaveLength(1);
    expect(comments[0]).toMatchObject({ recipientUserId: 'u2', actorUserId: 'u1' });
  });
});

describe('more task notifications', () => {
  it('tells the previous assignee when a task is reassigned or unassigned', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await updateTask(task._id, { assigneeId: 'p3' }, 'u1');
    await updateTask(task._id, { assigneeId: null }, 'u1');

    const unassigned = await ofType('task-unassigned');
    expect(unassigned.map(n => n.recipientUserId).sort()).toEqual(['u2', 'u3']);
  });

  it('tells the assignee about a status change by someone else, not their own', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await setTaskStatus(task._id, 'blocked', 'u2');
    expect(await ofType('task-status-changed')).toHaveLength(0);

    await setTaskStatus(task._id, 'cancelled', 'u1');
    const changed = await ofType('task-status-changed');
    expect(changed).toHaveLength(1);
    expect(changed[0]).toMatchObject({
      recipientUserId: 'u2',
      eventDetails: 'The task "Buy tiles" is now cancelled.',
    });
  });

  it('tells the creator when the assignee completes a task', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');

    await setTaskProgress(task._id, 100, 'u2');

    const completed = await ofType('task-completed');
    expect(completed).toHaveLength(1);
    expect(completed[0]).toMatchObject({ recipientUserId: 'u1', actorUserId: 'u2' });
  });

  it('sends one notification, not two, when the creator is the assignee', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u2');
    await setTaskStatus(task._id, 'done', 'u3');

    expect(await ofType('task-completed')).toHaveLength(0);
    expect(await ofType('task-status-changed')).toHaveLength(1);
  });

  it('tells the assignee when the due date changes, not for other edits', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await updateTask(task._id, { title: 'Buy more tiles' }, 'u1');
    expect(await ofType('task-due-date-changed')).toHaveLength(0);

    await updateTask(task._id, { dueDate: new Date('2030-01-15T00:00:00Z') }, 'u1');
    await updateTask(task._id, { dueDate: null }, 'u1');

    const changed = await ofType('task-due-date-changed');
    expect(changed).toHaveLength(1);
    expect(changed[0].eventDetails).toBe('The due date of "Buy more tiles" was removed.');
  });

  it('tells the assignee only when priority is raised to high or urgent', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await updateTask(task._id, { priority: 'low' }, 'u1');
    expect(await ofType('task-priority-changed')).toHaveLength(0);

    await updateTask(task._id, { priority: 'urgent' }, 'u1');
    const changed = await ofType('task-priority-changed');
    expect(changed).toHaveLength(1);
    expect(changed[0].recipientUserId).toBe('u2');
  });

  it('tells the assignee when a task is deleted', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await deleteTask(task._id, 'u1');

    const deleted = await ofType('task-deleted');
    expect(deleted).toHaveLength(1);
    expect(deleted[0].recipientUserId).toBe('u2');
  });
});

describe('more project notifications', () => {
  it('tells a removed participant', async () => {
    const project = await newProject(['p1', 'p2']);
    await removeProjectParticipant(project._id, 'p2', 'u1');

    const removed = await ofType('participant-removed');
    expect(removed).toHaveLength(1);
    expect(removed[0]).toMatchObject({ recipientUserId: 'u2', entityId: project._id });
  });

  it('tells participants when title, objective, description or dates change, not for tags', async () => {
    const project = await newProject(['p1', 'p2']);
    await updateProject(project._id, { tags: ['a'] }, 'u1');
    await updateProject(project._id, { title: 'Roof repair' }, 'u1');
    expect(await ofType('project-updated')).toHaveLength(0);

    await updateProject(project._id, { targetDate: new Date('2031-01-01T00:00:00Z') }, 'u1');
    await updateProject(project._id, { objective: 'Fix it' }, 'u1');

    const updated = await ofType('project-updated');
    expect(updated).toHaveLength(1);
    expect(updated[0].recipientUserId).toBe('u2');
  });

  it('tells participants when a project is deleted', async () => {
    const project = await newProject(['p1', 'p2', 'p3']);
    await deleteProject(project._id, 'u1');

    const deleted = await ofType('project-deleted');
    expect(deleted.map(n => n.recipientUserId).sort()).toEqual(['u2', 'u3']);
    expect(deleted[0].eventDetails).toBe('The project "Roof repair" was deleted.');
  });
});

describe('builders', () => {
  const now = new Date('2026-05-30T00:00:00Z');
  const project = { _id: 'pr1', workspaceId: 'ws1', title: 'Roof repair' };
  const task = { _id: 't1', workspaceId: 'ws1', projectId: 'pr1', title: 'Buy tiles' };

  it('builds the task assignment', () => {
    expect(buildTaskAssignedNotification(task, 'u2', 'u1', now)).toEqual({
      id: 'task-assigned:t1:u2',
      workspaceId: 'ws1',
      entityType: 'task',
      entityId: 't1',
      eventType: 'task-assigned',
      eventDetails: 'You were assigned the task "Buy tiles".',
      data: { projectId: 'pr1', at: now.toISOString() },
      createdAt: now,
      recipientUserId: 'u2',
      actorUserId: 'u1',
    });
  });

  it('builds the added-to-project, status and comment notifications', () => {
    expect(buildAddedToProjectNotification(project, 'u2', 'u1', now)).toMatchObject({
      id: 'project-added:pr1:u2',
      entityType: 'project',
      eventDetails: 'You were added to the project "Roof repair".',
    });
    expect(buildProjectStatusNotification(project, 'on-hold', 'u2', 'u1', now)).toMatchObject({
      id: 'project-status:pr1:u2',
      eventDetails: 'The project "Roof repair" is now on hold.',
      data: { status: 'on-hold', at: now.toISOString() },
    });
    expect(buildTaskCommentNotification(task, 'u2', 'u1', now)).toMatchObject({
      id: 'task-comment:t1:u2',
      eventDetails: 'There is a new comment on your task "Buy tiles".',
    });
  });
});
