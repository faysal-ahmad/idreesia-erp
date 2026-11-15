import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import Notifications from 'meteor/idreesia-common/server/collections/common/notifications';
import Committees from 'meteor/idreesia-common/server/collections/hr/committees';
import {
  ProjectComments,
  Projects,
  ProjectsActivities,
  ProjectTasks,
} from 'meteor/idreesia-common/server/collections/projects';

import {
  addTaskComment,
  createProject,
  createProjectsWorkspace,
  createTask,
  removeProjectParticipant,
} from './index';

// Each operation runs in one transaction: when its last write (the activity
// entry) fails, none of its earlier writes or notifications remain.

let workspaceId: string;

beforeEach(async () => {
  await Users.insertAsync({ _id: 'u1', personId: 'p1' } as any);
  await Users.insertAsync({ _id: 'u2', personId: 'p2' } as any);
  workspaceId = (await createProjectsWorkspace({ name: 'W' }, 'u1'))._id;
  await Committees.insertAsync({
    _id: 'c1',
    name: 'Committee',
    members: [],
    projectsWorkspaceId: workspaceId,
  } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const failActivityLog = () =>
  vi
    .spyOn(ProjectsActivities, 'insertAsync')
    .mockRejectedValueOnce(new Error('activity log failed'));

describe('projects transactions', () => {
  it('rolls back a task and the project stats when the task cannot be logged', async () => {
    const project = await createProject(
      { workspaceId, title: 'Roof', participantIds: ['p1', 'p2'] },
      'u1'
    );
    const notificationsBefore = await Notifications.find({}).countAsync();

    failActivityLog();
    await expect(
      createTask(
        { workspaceId, projectId: project._id, title: 'Tiles', assigneeId: 'p2' },
        'u1'
      )
    ).rejects.toThrow('activity log failed');

    expect(await ProjectTasks.find({}).countAsync()).toBe(0);
    expect((await Projects.findOneAsync(project._id))?.taskCount ?? 0).toBe(0);
    expect(await Notifications.find({}).countAsync()).toBe(notificationsBefore);
  });

  it('rolls back a comment and the comment count together', async () => {
    const task = await createTask({ workspaceId, title: 'Tiles' }, 'u1');

    failActivityLog();
    await expect(addTaskComment(task._id, 'Done?', 'u1')).rejects.toThrow();

    expect(await ProjectComments.find({}).countAsync()).toBe(0);
    expect((await ProjectTasks.findOneAsync(task._id))?.commentCount ?? 0).toBe(0);
  });

  it('keeps tasks assigned when removing the participant fails', async () => {
    const project = await createProject(
      { workspaceId, title: 'Roof', participantIds: ['p1', 'p2'] },
      'u1'
    );
    const task = await createTask(
      { workspaceId, projectId: project._id, title: 'Tiles', assigneeId: 'p2' },
      'u1'
    );

    failActivityLog();
    await expect(
      removeProjectParticipant(project._id, 'p2', 'u1', { unassignTasks: true })
    ).rejects.toThrow();

    expect((await ProjectTasks.findOneAsync(task._id))?.assigneeId).toBe('p2');
    expect((await Projects.findOneAsync(project._id))?.participantIds).toContain('p2');
  });
});
