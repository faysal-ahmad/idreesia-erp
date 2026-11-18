import { beforeEach, describe, expect, it } from 'vitest';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import Committees from 'meteor/idreesia-common/server/collections/admin/committees';
import { ProjectsActivities } from 'meteor/idreesia-common/server/collections/projects';

import {
  addProjectParticipants,
  createProject,
  createProjectsWorkspace,
  createTask,
  getProject,
  listParticipantProjects,
  listProjects,
  removeProjectParticipant,
  setProjectStatus,
  setTaskStatus,
  updateProject,
} from './index';

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

const make = (extra: Record<string, unknown> = {}) =>
  createProject({ workspaceId, title: 'Roof', participantIds: ['p1', 'p2'], ...extra }, 'u1');

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

const actions = async (projectId: string) =>
  (await ProjectsActivities.find({ projectId }, { sort: { at: 1 } }).fetchAsync()).map(
    (a: any) => a.action
  );

describe('createProject', () => {
  it('defaults to active with zeroed stats, dedupes participants and logs creation', async () => {
    const project = await make({ participantIds: ['p1', 'p1', ' p2 '] });
    expect(project).toMatchObject({
      status: 'active',
      taskCount: 0,
      doneCount: 0,
      progress: 0,
      createdBy: 'u1',
    });
    expect(project.participantIds.sort()).toEqual(['p1', 'p2']);
    expect(await actions(project._id)).toEqual(['project-created']);
  });

  it.each(['completed', 'cancelled'])('cannot start out %s', async status => {
    await rejectsWith(make({ status }), 'BAD_USER_INPUT');
  });

  it('accepts planned and on-hold starts', async () => {
    expect((await make({ status: 'planned' })).status).toBe('planned');
    expect((await make({ status: 'on-hold' })).status).toBe('on-hold');
  });

  it('rejects a bad status, empty title, reversed dates and bad metadata', async () => {
    await rejectsWith(make({ status: 'x' }), 'BAD_USER_INPUT');
    await rejectsWith(make({ title: '' }), 'BAD_USER_INPUT');
    await rejectsWith(
      make({ startDate: '2026-02-01', targetDate: '2026-01-01' }),
      'BAD_USER_INPUT'
    );
    await rejectsWith(make({ metadata: { 'bad key!': 1 } }), 'BAD_USER_INPUT');
  });

  it('fails for a missing workspace', async () => {
    await rejectsWith(
      createProject({ workspaceId: 'nope', title: 'x' }, 'u1'),
      'NOT_FOUND'
    );
  });
});

describe('setProjectStatus', () => {
  it('refuses to complete a project with open tasks, reporting how many', async () => {
    const project = await make();
    await createTask({ workspaceId, projectId: project._id, title: 'a' }, 'u1');
    await createTask({ workspaceId, projectId: project._id, title: 'b' }, 'u1');
    await expect(setProjectStatus(project._id, 'completed', 'u1')).rejects.toMatchObject({
      message: '2 tasks are still open',
      extensions: { code: 'CONFLICT', openTasks: 2 },
    });
  });

  it('uses the singular for one open task', async () => {
    const project = await make();
    await createTask({ workspaceId, projectId: project._id, title: 'a' }, 'u1');
    await expect(setProjectStatus(project._id, 'completed', 'u1')).rejects.toMatchObject({
      message: '1 task is still open',
    });
  });

  it('completes once tasks are done or cancelled, recording who and when', async () => {
    const project = await make();
    const a = await createTask({ workspaceId, projectId: project._id, title: 'a' }, 'u1');
    const b = await createTask({ workspaceId, projectId: project._id, title: 'b' }, 'u1');
    await setTaskStatus(a._id, 'done', 'u1');
    await setTaskStatus(b._id, 'cancelled', 'u1');
    const done = await setProjectStatus(project._id, 'completed', 'u2');
    expect(done).toMatchObject({ status: 'completed', completedBy: 'u2' });
    expect(done.completedAt).toBeInstanceOf(Date);
  });

  it('force completes despite open tasks', async () => {
    const project = await make();
    await createTask({ workspaceId, projectId: project._id, title: 'a' }, 'u1');
    expect((await setProjectStatus(project._id, 'completed', 'u1', { force: true })).status).toBe(
      'completed'
    );
  });

  it('clears completion when a project is reopened', async () => {
    const project = await make();
    await setProjectStatus(project._id, 'completed', 'u1');
    const reopened = await setProjectStatus(project._id, 'active', 'u1');
    expect(reopened.completedAt).toBeUndefined();
    expect(reopened.completedBy).toBeUndefined();
  });

  it('is a no-op for the current status and rejects unknown ones', async () => {
    const project = await make();
    const same = await setProjectStatus(project._id, 'active', 'u1');
    expect(same.revision).toBe(project.revision);
    expect(await actions(project._id)).toEqual(['project-created']);
    await rejectsWith(setProjectStatus(project._id, 'x' as any, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(setProjectStatus('nope', 'on-hold', 'u1'), 'NOT_FOUND');
  });

  it('logs the transition with from/to', async () => {
    const project = await make();
    await setProjectStatus(project._id, 'on-hold', 'u1');
    const entry = (await ProjectsActivities.findOneAsync({
      projectId: project._id,
      action: 'project-status-changed',
    })) as any;
    expect(entry.details).toEqual({ from: 'active', to: 'on-hold' });
  });
});

describe('participants', () => {
  it('ignores already-listed participants without logging', async () => {
    const project = await make();
    const same = await addProjectParticipants(project._id, ['p1'], 'u1');
    expect(same.revision).toBe(project.revision);
    expect(await actions(project._id)).toEqual(['project-created']);
  });

  it('adds new participants and logs only the new ones', async () => {
    const project = await make({ participantIds: ['p1'] });
    const updated = await addProjectParticipants(project._id, ['p1', 'p3'], 'u1');
    expect(updated.participantIds.sort()).toEqual(['p1', 'p3']);
    const entry = (await ProjectsActivities.findOneAsync({
      action: 'participants-added',
    })) as any;
    expect(entry.details.participantIds).toEqual(['p3']);
  });

  it('refuses to remove a participant with open tasks unless tasks are unassigned', async () => {
    const project = await make();
    const task = await createTask(
      { workspaceId, projectId: project._id, title: 't', assigneeId: 'p2' },
      'u1'
    );
    await expect(removeProjectParticipant(project._id, 'p2', 'u1')).rejects.toMatchObject({
      extensions: { code: 'CONFLICT', openTasks: 1 },
    });
    const updated = await removeProjectParticipant(project._id, 'p2', 'u1', {
      unassignTasks: true,
    });
    expect(updated.participantIds).toEqual(['p1']);
    const { ProjectTasks } = await import('meteor/idreesia-common/server/collections/projects');
    expect((await ProjectTasks.findOneAsync(task._id))?.assigneeId).toBeUndefined();
  });

  it('does not block removal because of finished tasks, and ignores non-participants', async () => {
    const project = await make();
    const task = await createTask(
      { workspaceId, projectId: project._id, title: 't', assigneeId: 'p2' },
      'u1'
    );
    await setTaskStatus(task._id, 'done', 'u1');
    expect(
      (await removeProjectParticipant(project._id, 'p2', 'u1')).participantIds
    ).toEqual(['p1']);
    const same = await removeProjectParticipant(project._id, 'p9', 'u1');
    expect(same.participantIds).toEqual(['p1']);
  });
});

describe('updateProject', () => {
  it('validates date order against the stored dates', async () => {
    const project = await make({ startDate: '2026-02-01' });
    await rejectsWith(updateProject(project._id, { targetDate: '2026-01-01' }, 'u1'), 'BAD_USER_INPUT');
    const ok = await updateProject(project._id, { targetDate: '2026-03-01' }, 'u1');
    expect(ok.targetDate).toBeInstanceOf(Date);
  });

  it('clears objective and dates with null and logs which fields changed', async () => {
    const project = await make({ objective: 'o', startDate: '2026-02-01' });
    const updated = await updateProject(project._id, { objective: null, startDate: null }, 'u1');
    expect(updated.objective).toBeUndefined();
    expect(updated.startDate).toBeUndefined();
    const entry = (await ProjectsActivities.findOneAsync({ action: 'project-updated' })) as any;
    expect(entry.details.changed.sort()).toEqual(['objective', 'startDate']);
  });
});

describe('listing', () => {
  it('filters by status, participant, tags and sorts by title', async () => {
    const a = await make({ title: 'Alpha', participantIds: ['p1'], tags: ['x'] });
    const b = await make({ title: 'Beta', participantIds: ['p2'], status: 'planned' });
    const ids = async (o: any) => (await listProjects(workspaceId, 'u1', o)).data.map(p => p._id);
    expect(await ids({ status: ['planned'] })).toEqual([b._id]);
    expect(await ids({ participantId: 'p1' })).toEqual([a._id]);
    expect(await ids({ tags: ['x'] })).toEqual([a._id]);
    expect(await ids({ sortBy: 'title' })).toEqual([a._id, b._id]);
    expect((await listProjects(workspaceId, 'u1', { limit: 1 })).totalResults).toBe(2);
    await rejectsWith(listProjects(workspaceId, 'u1', { status: 'x' as any }), 'BAD_USER_INPUT');
  });

  it("lists a person's projects limited to authorised workspaces", async () => {
    const other = (await createProjectsWorkspace({ name: 'W2' }, 'u1'))._id;
    const a = await make({ participantIds: ['p1'] });
    const b = await createProject({ workspaceId: other, title: 'B', participantIds: ['p1'] }, 'u1');
    expect((await listParticipantProjects('p1', 'u1')).totalResults).toBe(2);
    const scoped = await listParticipantProjects('p1', 'u1', { workspaceIds: [other] });
    expect(scoped.data.map(p => p._id)).toEqual([b._id]);
    expect(a._id).not.toBe(b._id);
  });

  it('getProject requires an existing project', async () => {
    await rejectsWith(getProject('nope', 'u1'), 'NOT_FOUND');
  });
});
