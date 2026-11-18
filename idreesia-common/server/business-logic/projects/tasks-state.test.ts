import { beforeEach, describe, expect, it } from 'vitest';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import Committees from 'meteor/idreesia-common/server/collections/admin/committees';
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
  deleteProject,
  deleteTask,
  deleteTaskComment,
  getTask,
  getTaskComment,
  isTaskOverdue,
  listAssigneeTasks,
  listProjectsActivity,
  listTaskComments,
  listTasks,
  setProjectStatus,
  setTaskProgress,
  setTaskStatus,
  updateTask,
} from './index';

let workspaceId: string;
let projectId: string;

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
  projectId = (
    await createProject({ workspaceId, title: 'Roof', participantIds: ['p1', 'p2'] }, 'u1')
  )._id;
});

const actions = async (taskId: string) =>
  (await ProjectsActivities.find({ taskId }, { sort: { at: 1 } }).fetchAsync()).map(
    (a: any) => a.action
  );

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

describe('createTask', () => {
  it('starts as todo with zero progress and normal priority, and logs it', async () => {
    const task = await createTask({ workspaceId, projectId, title: '  Tiles ' }, 'u1');
    expect(task).toMatchObject({
      title: 'Tiles',
      status: 'todo',
      progress: 0,
      priority: 'normal',
      commentCount: 0,
      createdBy: 'u1',
    });
    expect((await Projects.findOneAsync(projectId))?.taskCount).toBe(1);
    expect(await actions(task._id)).toEqual(['task-created']);
  });

  it('rejects an assignee who is not a project participant', async () => {
    await rejectsWith(
      createTask({ workspaceId, projectId, title: 'T', assigneeId: 'p9' }, 'u1'),
      'CONFLICT'
    );
    expect(await ProjectTasks.find({}).countAsync()).toBe(0);
  });

  it('allows any assignee on a standalone task', async () => {
    const task = await createTask({ workspaceId, title: 'T', assigneeId: 'p9' }, 'u1');
    expect(task.assigneeId).toBe('p9');
    expect(task.projectId).toBeUndefined();
  });

  it('rejects invalid input', async () => {
    await rejectsWith(createTask({ workspaceId, title: '  ' }, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(
      createTask({ workspaceId, title: 'T', priority: 'nope' as any }, 'u1'),
      'BAD_USER_INPUT'
    );
    await rejectsWith(
      createTask({ workspaceId, title: 'T', dueDate: 'not a date' }, 'u1'),
      'BAD_USER_INPUT'
    );
    await rejectsWith(createTask({ workspaceId, title: 'T' }, ''), 'BAD_USER_INPUT');
  });

  it('fails for a missing project or workspace', async () => {
    await rejectsWith(
      createTask({ workspaceId, projectId: 'nope', title: 'T' }, 'u1'),
      'NOT_FOUND'
    );
    await rejectsWith(createTask({ workspaceId: 'nope', title: 'T' }, 'u1'), 'NOT_FOUND');
  });

  it.each(['completed', 'cancelled'] as const)(
    'refuses to add a task to a %s project',
    async status => {
      await setProjectStatus(projectId, status, 'u1', { force: true });
      await rejectsWith(createTask({ workspaceId, projectId, title: 'T' }, 'u1'), 'CONFLICT');
    }
  );

  it('still allows tasks in an on-hold project', async () => {
    await setProjectStatus(projectId, 'on-hold', 'u1');
    await expect(createTask({ workspaceId, projectId, title: 'T' }, 'u1')).resolves.toBeDefined();
  });
});

describe('setTaskStatus', () => {
  it('completing a task sets progress 100 and records who completed it', async () => {
    const task = await createTask({ workspaceId, projectId, title: 'T' }, 'u1');
    const done = await setTaskStatus(task._id, 'done', 'u2');
    expect(done).toMatchObject({ status: 'done', progress: 100, completedBy: 'u2' });
    expect(done.completedAt).toBeInstanceOf(Date);
    expect((await Projects.findOneAsync(projectId))?.doneCount).toBe(1);
    expect(await actions(task._id)).toEqual(['task-created', 'task-status-changed']);
  });

  it('reopening a done task to todo resets progress and clears completion', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await setTaskStatus(task._id, 'done', 'u1');
    const reopened = await setTaskStatus(task._id, 'todo', 'u1');
    expect(reopened.progress).toBe(0);
    expect(reopened.completedAt).toBeUndefined();
    expect(reopened.completedBy).toBeUndefined();
  });

  it('reopening a done task to in-progress keeps progress at most 99', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await setTaskStatus(task._id, 'done', 'u1');
    expect((await setTaskStatus(task._id, 'in-progress', 'u1')).progress).toBe(99);
  });

  it('is a no-op (no activity, no revision bump) when the status is unchanged', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    const same = await setTaskStatus(task._id, 'todo', 'u1');
    expect(same.revision).toBe(task.revision);
    expect(await actions(task._id)).toEqual(['task-created']);
  });

  it('rejects an unknown status', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await rejectsWith(setTaskStatus(task._id, 'weird' as any, 'u1'), 'BAD_USER_INPUT');
  });

  it("can't change a task of a completed project", async () => {
    const task = await createTask({ workspaceId, projectId, title: 'T' }, 'u1');
    await setTaskStatus(task._id, 'done', 'u1');
    await setProjectStatus(projectId, 'completed', 'u1');
    await rejectsWith(setTaskStatus(task._id, 'todo', 'u1'), 'CONFLICT');
    await rejectsWith(updateTask(task._id, { title: 'X' }, 'u1'), 'CONFLICT');
    await rejectsWith(setTaskProgress(task._id, 10, 'u1'), 'CONFLICT');
  });
});

describe('setTaskProgress', () => {
  it('starts a todo task when progress goes above zero', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    const updated = await setTaskProgress(task._id, 40, 'u1');
    expect(updated).toMatchObject({ status: 'in-progress', progress: 40 });
    expect(await actions(task._id)).toEqual([
      'task-created',
      'task-progress-changed',
      'task-status-changed',
    ]);
  });

  it('keeps a todo task todo at progress 0 and logs no status change', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await setTaskProgress(task._id, 0, 'u1');
    expect(await actions(task._id)).toEqual(['task-created', 'task-progress-changed']);
  });

  it('keeps a blocked task blocked while progress changes', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await setTaskStatus(task._id, 'blocked', 'u1');
    expect((await setTaskProgress(task._id, 30, 'u1')).status).toBe('blocked');
  });

  it('completes the task at 100', async () => {
    const task = await createTask({ workspaceId, projectId, title: 'T' }, 'u1');
    const done = await setTaskProgress(task._id, 100, 'u2');
    expect(done).toMatchObject({ status: 'done', completedBy: 'u2' });
    expect((await Projects.findOneAsync(projectId))?.doneCount).toBe(1);
  });

  it.each([-1, 101, 1.5, NaN, '50' as any])('rejects invalid progress %s', async value => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await rejectsWith(setTaskProgress(task._id, value, 'u1'), 'BAD_USER_INPUT');
  });

  it.each(['done', 'cancelled'] as const)('refuses progress on a %s task', async status => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await setTaskStatus(task._id, status, 'u1');
    await rejectsWith(setTaskProgress(task._id, 20, 'u1'), 'CONFLICT');
  });
});

describe('updateTask', () => {
  it('reassigns, logs both entries and only assignable participants are accepted', async () => {
    const task = await createTask({ workspaceId, projectId, title: 'T', assigneeId: 'p1' }, 'u1');
    await rejectsWith(updateTask(task._id, { assigneeId: 'p9' }, 'u1'), 'CONFLICT');
    const updated = await updateTask(task._id, { assigneeId: 'p2' }, 'u1');
    expect(updated.assigneeId).toBe('p2');
    expect(await actions(task._id)).toEqual(['task-created', 'task-updated', 'task-assigned']);
    const assigned = (await ProjectsActivities.findOneAsync({
      taskId: task._id,
      action: 'task-assigned',
    })) as any;
    expect(assigned.details).toEqual({ from: 'p1', to: 'p2' });
  });

  it('unassigns with null and clears optional fields', async () => {
    const task = await createTask(
      { workspaceId, title: 'T', assigneeId: 'p1', description: 'd', dueDate: new Date() },
      'u1'
    );
    const updated = await updateTask(
      task._id,
      { assigneeId: null, description: null, dueDate: null },
      'u1'
    );
    expect(updated.assigneeId).toBeUndefined();
    expect(updated.description).toBeUndefined();
    expect(updated.dueDate).toBeUndefined();
  });

  it('does not log an assignment when the assignee is unchanged', async () => {
    const task = await createTask({ workspaceId, title: 'T', assigneeId: 'p1' }, 'u1');
    await updateTask(task._id, { assigneeId: 'p1', title: 'T2' }, 'u1');
    expect(await actions(task._id)).toEqual(['task-created', 'task-updated']);
  });

  it('bumps the revision on every change', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    const updated = await updateTask(task._id, { title: 'T2' }, 'u1');
    expect(updated.revision).toBe(task.revision + 1);
    expect(updated.updatedBy).toBe('u1');
  });

  it('rejects an empty title and a bad priority', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await rejectsWith(updateTask(task._id, { title: '' }, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(updateTask(task._id, { priority: 'x' as any }, 'u1'), 'BAD_USER_INPUT');
  });

  it('fails for a missing task', async () => {
    await rejectsWith(updateTask('nope', { title: 'x' }, 'u1'), 'NOT_FOUND');
  });
});

describe('deleteTask / comments', () => {
  it('deletes the task and its comments, refreshes project stats, keeps the activity', async () => {
    const task = await createTask({ workspaceId, projectId, title: 'T' }, 'u1');
    await addTaskComment(task._id, 'hello', 'u2');
    await deleteTask(task._id, 'u1');
    expect(await ProjectTasks.find({}).countAsync()).toBe(0);
    expect(await ProjectComments.find({}).countAsync()).toBe(0);
    expect((await Projects.findOneAsync(projectId))?.taskCount).toBe(0);
    expect(await actions(task._id)).toContain('task-deleted');
  });

  it('fails for a missing task', async () => {
    await rejectsWith(deleteTask('nope', 'u1'), 'NOT_FOUND');
  });

  it('adds comments with author, count and an activity entry that has no text', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    const comment = await addTaskComment(task._id, '  secret text  ', 'u2');
    expect(comment).toMatchObject({ text: 'secret text', authorId: 'u2', taskId: task._id });
    expect((await ProjectTasks.findOneAsync(task._id))?.commentCount).toBe(1);
    const entry = (await ProjectsActivities.findOneAsync({
      action: 'comment-added',
    })) as any;
    expect(JSON.stringify(entry)).not.toContain('secret text');
  });

  it('rejects blank and over-long comments', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await rejectsWith(addTaskComment(task._id, '   ', 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(addTaskComment(task._id, 'x'.repeat(100000), 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(addTaskComment('nope', 'hi', 'u1'), 'NOT_FOUND');
  });

  it('deletes a comment and decrements the count without going negative', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    const comment = await addTaskComment(task._id, 'hi', 'u1');
    await deleteTaskComment(comment._id, 'u2');
    expect((await ProjectTasks.findOneAsync(task._id))?.commentCount).toBe(0);
    expect(await actions(task._id)).toContain('comment-deleted');
    await rejectsWith(deleteTaskComment(comment._id, 'u1'), 'NOT_FOUND');
    await rejectsWith(getTaskComment('', 'u1'), 'NOT_FOUND');
  });

  it('treats a comment whose task is gone as not found', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    const comment = await addTaskComment(task._id, 'hi', 'u1');
    await ProjectTasks.removeAsync(task._id);
    await rejectsWith(getTaskComment(comment._id, 'u1'), 'NOT_FOUND');
  });

  it('lists comments oldest first with paging and total', async () => {
    const task = await createTask({ workspaceId, title: 'T' }, 'u1');
    await addTaskComment(task._id, 'one', 'u1');
    await new Promise<void>(resolve => {
      setTimeout(resolve, 5);
    });
    await addTaskComment(task._id, 'two', 'u1');
    await new Promise<void>(resolve => {
      setTimeout(resolve, 5);
    });
    await addTaskComment(task._id, 'three', 'u1');
    const page = await listTaskComments(task._id, 'u1', { skip: 1, limit: 1 });
    expect(page.totalResults).toBe(3);
    expect(page.data.map(c => c.text)).toEqual(['two']);
  });
});

describe('listing and queries', () => {
  it('filters by status, priority, assignee, unassigned, standalone and tags', async () => {
    const a = await createTask(
      { workspaceId, projectId, title: 'A', assigneeId: 'p1', priority: 'high', tags: ['x'] },
      'u1'
    );
    const b = await createTask({ workspaceId, title: 'B', priority: 'low' }, 'u1');
    await setTaskStatus(b._id, 'done', 'u1');

    const ids = async (opts: any) =>
      (await listTasks(workspaceId, 'u1', opts)).data.map(t => t._id);
    expect(await ids({ status: 'done' })).toEqual([b._id]);
    expect(await ids({ priority: ['high'] })).toEqual([a._id]);
    expect(await ids({ assigneeId: 'p1' })).toEqual([a._id]);
    expect(await ids({ unassigned: true })).toEqual([b._id]);
    expect(await ids({ standalone: true })).toEqual([b._id]);
    expect(await ids({ projectId })).toEqual([a._id]);
    expect(await ids({ projectIds: [], projectId })).toEqual([]);
    expect(await ids({ tags: ['x'] })).toEqual([a._id]);
    await rejectsWith(listTasks(workspaceId, 'u1', { status: 'bad' as any }), 'BAD_USER_INPUT');
    await rejectsWith(
      listTasks(workspaceId, 'u1', { metadata: { 'bad key!': 1 } }),
      'BAD_USER_INPUT'
    );
  });

  it('overdue only matches open tasks with a past due date', async () => {
    const past = new Date(Date.now() - 86400000);
    const open = await createTask({ workspaceId, title: 'open', dueDate: past }, 'u1');
    const done = await createTask({ workspaceId, title: 'done', dueDate: past }, 'u1');
    await setTaskStatus(done._id, 'done', 'u1');
    await createTask({ workspaceId, title: 'future', dueDate: new Date(Date.now() + 86400000) }, 'u1');
    const result = await listTasks(workspaceId, 'u1', { overdue: true });
    expect(result.data.map(t => t._id)).toEqual([open._id]);
    expect(isTaskOverdue(open)).toBe(true);
    expect(isTaskOverdue((await ProjectTasks.findOneAsync(done._id))!)).toBe(false);
    expect(isTaskOverdue({ status: 'todo' })).toBe(false);
  });

  it('sorts by priority, and by due date with undated tasks last', async () => {
    const low = await createTask({ workspaceId, title: 'l', priority: 'low' }, 'u1');
    const urgent = await createTask({ workspaceId, title: 'u', priority: 'urgent' }, 'u1');
    const dated = await createTask(
      { workspaceId, title: 'd', dueDate: new Date(Date.now() + 1000) },
      'u1'
    );
    const byPriority = await listTasks(workspaceId, 'u1', { sortBy: 'priority', sortOrder: 'desc' });
    expect(byPriority.data[0]._id).toBe(urgent._id);
    expect(byPriority.data[byPriority.data.length - 1]._id).toBe(low._id);
    const byDue = await listTasks(workspaceId, 'u1', { sortBy: 'dueDate' });
    expect(byDue.data[0]._id).toBe(dated._id);
    expect(byDue.totalResults).toBe(3);
  });

  it("lists a person's open tasks across workspaces, limited to authorised ones", async () => {
    const other = (await createProjectsWorkspace({ name: 'W2' }, 'u1'))._id;
    const t1 = await createTask({ workspaceId, title: 'a', assigneeId: 'p1' }, 'u1');
    const t2 = await createTask({ workspaceId: other, title: 'b', assigneeId: 'p1' }, 'u1');
    const t3 = await createTask({ workspaceId, title: 'c', assigneeId: 'p1' }, 'u1');
    await setTaskStatus(t3._id, 'done', 'u1');

    const all = await listAssigneeTasks('p1', 'u1');
    expect(all.data.map(t => t._id).sort()).toEqual([t1._id, t2._id].sort());
    const scoped = await listAssigneeTasks('p1', 'u1', { workspaceIds: [other] });
    expect(scoped.data.map(t => t._id)).toEqual([t2._id]);
    const withDone = await listAssigneeTasks('p1', 'u1', { status: ['done'] });
    expect(withDone.data.map(t => t._id)).toEqual([t3._id]);
  });

  it('getTask requires a user and an existing task', async () => {
    await rejectsWith(getTask('nope', 'u1'), 'NOT_FOUND');
    await rejectsWith(getTask('nope', ''), 'BAD_USER_INPUT');
  });
});

describe('deleteProject', () => {
  it('detaches tasks by default, keeping them standalone', async () => {
    const task = await createTask({ workspaceId, projectId, title: 'T' }, 'u1');
    await deleteProject(projectId, 'u1');
    expect(await Projects.find({}).countAsync()).toBe(0);
    expect((await ProjectTasks.findOneAsync(task._id))?.projectId).toBeUndefined();
  });

  it('can delete the tasks and their comments with the project', async () => {
    const task = await createTask({ workspaceId, projectId, title: 'T' }, 'u1');
    await addTaskComment(task._id, 'c', 'u1');
    await deleteProject(projectId, 'u1', { tasks: 'delete' });
    expect(await ProjectTasks.find({}).countAsync()).toBe(0);
    expect(await ProjectComments.find({}).countAsync()).toBe(0);
    const log = await listProjectsActivity(workspaceId, 'u1', { projectId });
    expect(log.map((e: any) => e.action)).toContain('project-deleted');
  });

  it('rejects an unknown tasks option', async () => {
    await rejectsWith(deleteProject(projectId, 'u1', { tasks: 'x' as any }), 'BAD_USER_INPUT');
  });
});
