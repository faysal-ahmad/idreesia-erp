import { beforeEach, describe, expect, it } from 'vitest';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import Committees from 'meteor/idreesia-common/server/collections/hr/committees';

import {
  getMyNotificationCounts,
  getMyNotifications,
  markMyNotificationsRead,
} from '../hr/committee/notifications';
import {
  addTaskComment,
  createProject,
  createProjectsWorkspace,
  createTask,
  updateTask,
} from './index';

// What the mobile notifications page asks the server for: a committee's
// "projects" notifications for the signed-in user, their counts, and
// marking them read.

const actor = { _id: 'u1', personId: 'p1' };
const assignee = { _id: 'u2', personId: 'p2' };

let workspaceId: string;

const mine = (user = assignee, extra: { limit?: number; offset?: number } = {}) =>
  getMyNotifications(user, { committeeId: 'c1', module: 'projects', ...extra });

beforeEach(async () => {
  await Users.insertAsync(actor as any);
  await Users.insertAsync(assignee as any);
  workspaceId = (await createProjectsWorkspace({ name: 'W' }, 'u1'))._id;
  await Committees.insertAsync({
    _id: 'c1',
    name: 'Committee',
    members: [{ karkunId: 'p1' }, { karkunId: 'p2' }],
    features: ['projects'],
    projectsWorkspaceId: workspaceId,
  } as any);
});

describe('project notifications on the notifications page', () => {
  it('lists task and project notifications with what the screen needs to open them', async () => {
    const project = await createProject(
      { workspaceId, title: 'Roof repair', participantIds: ['p1', 'p2'] },
      'u1'
    );
    const task = await createTask(
      { workspaceId, projectId: project._id, title: 'Buy tiles', assigneeId: 'p2' },
      'u1'
    );

    const list = await mine();

    expect(list.map(n => [n.entityType, n.entityId, n.isRead]).sort()).toEqual(
      [
        ['project', project._id, false],
        ['task', task._id, false],
      ].sort()
    );
    expect(list.every(n => n.module === 'projects' && n.committeeId === 'c1')).toBe(true);
    const taskRow = list.find(n => n.entityType === 'task')!;
    expect(taskRow.eventDetails).toBe('You were assigned the task "Buy tiles".');
    expect(JSON.parse(taskRow.data!)).toMatchObject({ projectId: project._id });
  });

  it('shows nothing to the person who caused the events', async () => {
    await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    expect(await mine(actor as any)).toEqual([]);
  });

  it('counts unread ones for the bell, and clears the count once they are marked read', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await addTaskComment(task._id, 'Any update?', 'u1');
    expect(await getMyNotificationCounts(assignee)).toEqual([
      { committeeId: 'c1', module: 'projects', unreadCount: 2 },
    ]);

    await markMyNotificationsRead(assignee, (await mine()).map(n => n._id));

    expect(await getMyNotificationCounts(assignee)).toEqual([]);
    expect((await mine()).every(n => n.isRead)).toBe(true);
  });

  it('shows a changed notification as unread again', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await markMyNotificationsRead(assignee, (await mine()).map(n => n._id));
    expect((await mine())[0].isRead).toBe(true);

    await updateTask(task._id, { assigneeId: 'p1' }, 'u1');
    await updateTask(task._id, { assigneeId: 'p2' }, 'u1');

    const assigned = (await mine()).find(n => n.eventType === 'task-assigned')!;
    expect(assigned.isRead).toBe(false);
  });

  it('shows each new comment as unread again, even when the text is the same', async () => {
    const task = await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    await addTaskComment(task._id, 'Any update?', 'u1');
    await markMyNotificationsRead(assignee, (await mine()).map(n => n._id));
    expect((await mine()).every(n => n.isRead)).toBe(true);

    await addTaskComment(task._id, 'Any update?', 'u1');

    const comment = (await mine()).find(n => n.eventType === 'comment-added')!;
    expect(comment.isRead).toBe(false);
  });

  it('pages with limit and offset, newest first, without repeating rows', async () => {
    for (let i = 1; i <= 5; i += 1) {
      await createTask({ workspaceId, title: `Task ${i}`, assigneeId: 'p2' }, 'u1');
    }

    const first = await mine(assignee, { limit: 2 });
    const second = await mine(assignee, { limit: 2, offset: 2 });
    const third = await mine(assignee, { limit: 2, offset: 4 });

    const ids = [...first, ...second, ...third].map(n => n._id);
    expect(ids).toHaveLength(5);
    expect(new Set(ids).size).toBe(5);
    expect(first[0].eventDetails).toContain('Task 5');
  });

  it('is empty for someone who is not in the committee, and when the feature is off', async () => {
    await createTask({ workspaceId, title: 'Buy tiles', assigneeId: 'p2' }, 'u1');
    expect(await mine({ _id: 'u3', personId: 'p3' })).toEqual([]);

    await Committees.updateAsync('c1', { $set: { features: [] } });
    expect(await mine()).toEqual([]);
    expect(await getMyNotificationCounts(assignee)).toEqual([]);
  });
});
