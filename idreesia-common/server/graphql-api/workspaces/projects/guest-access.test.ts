import { beforeEach, describe, expect, it, vi } from 'vitest';

// The committee index reaches native image code that unit tests cannot load.
// These tests need only the projects files of it.
vi.mock('meteor/idreesia-common/server/business-logic/hr/committee', async () => ({
  ...(await import(
    'meteor/idreesia-common/server/business-logic/hr/committee/projects'
  )),
  ...(await import(
    'meteor/idreesia-common/server/business-logic/hr/committee/projects-view'
  )),
  ...(await import(
    'meteor/idreesia-common/server/business-logic/hr/committee/meetings-view'
  )),
}));

import {
  createProject,
  createTask,
} from 'meteor/idreesia-common/server/business-logic/projects';
import { projectsModule } from 'meteor/idreesia-common/server/business-logic/projects/module';
import {
  getCommitteeProjectMembers,
  getPeopleInProjectsOf,
  listCommitteeProjects,
  listCommitteeTasks,
  type CommitteeDoc,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  assertProjectInWorkspace,
  assertTaskInWorkspace,
  guestParticipantId,
  type ProjectsAccess,
} from './access';

let workspaceId: string;
let inProjectId: string;
let otherProjectId: string;
let inTaskId: string;
let otherTaskId: string;
let standaloneTaskId: string;

const committee = {
  _id: 'c1',
  members: [
    { karkunId: 'guest1', role: 'guest' },
    { karkunId: 'member1', role: 'member' },
    { karkunId: 'member2', role: 'member' },
    { karkunId: 'member3', role: 'member' },
  ],
} as unknown as CommitteeDoc;

const access = (overrides: Partial<ProjectsAccess> = {}): ProjectsAccess => ({
  workspaceId,
  committee,
  userId: 'u-guest',
  personId: 'guest1',
  isCoordinator: false,
  isGuest: true,
  ...overrides,
});

beforeEach(async () => {
  workspaceId = (
    await projectsModule.createWorkspace({ name: 'Projects', createdBy: 'u1' })
  ).workspaceId;
  inProjectId = (
    await createProject(
      { workspaceId, title: 'Mine', participantIds: ['guest1', 'member1'] },
      'u-coord'
    )
  )._id;
  otherProjectId = (
    await createProject(
      { workspaceId, title: 'Theirs', participantIds: ['member2'] },
      'u-coord'
    )
  )._id;
  inTaskId = (
    await createTask({ workspaceId, projectId: inProjectId, title: 'T1' }, 'u-coord')
  )._id;
  otherTaskId = (
    await createTask({ workspaceId, projectId: otherProjectId, title: 'T2' }, 'u-coord')
  )._id;
  standaloneTaskId = (
    await createTask({ workspaceId, title: 'T3' }, 'u-coord')
  )._id;
});

describe('guests in projects', () => {
  it('narrows lists to the guest only', () => {
    expect(guestParticipantId(access())).toBe('guest1');
    expect(guestParticipantId(access({ personId: null }))).toBe('-');
    expect(guestParticipantId(access({ isGuest: false }))).toBeUndefined();
  });

  it('lists only the projects the guest takes part in', async () => {
    const guest = await listCommitteeProjects(workspaceId, access(), {
      view: 'all',
      participantId: guestParticipantId(access()),
    });
    expect(guest.data.map(({ title }) => title)).toEqual(['Mine']);

    const member = await listCommitteeProjects(
      workspaceId,
      access({ isGuest: false, personId: 'member3' }),
      { view: 'all' }
    );
    expect(member.data.map(({ title }) => title).sort()).toEqual([
      'Mine',
      'Theirs',
    ]);
  });

  it('keeps the guest filter on the "mine" view too', async () => {
    const mine = await listCommitteeProjects(workspaceId, access(), {
      view: 'mine',
      participantId: guestParticipantId(access()),
    });
    expect(mine.data.map(({ title }) => title)).toEqual(['Mine']);
  });

  it('opens a project only when the guest takes part in it', async () => {
    await expect(
      assertProjectInWorkspace(access(), inProjectId)
    ).resolves.toMatchObject({ _id: inProjectId });
    await expect(
      assertProjectInWorkspace(access(), otherProjectId)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(
      assertProjectInWorkspace(access({ isGuest: false }), otherProjectId)
    ).resolves.toMatchObject({ _id: otherProjectId });
  });

  it('lists only the tasks of the guest\'s projects, never standalone ones', async () => {
    const guest = await listCommitteeTasks(workspaceId, access(), {
      view: 'all',
      participantId: guestParticipantId(access()),
    });
    expect(guest.data.map(({ _id }) => _id)).toEqual([inTaskId]);

    const asked = await listCommitteeTasks(workspaceId, access(), {
      view: 'all',
      projectId: otherProjectId,
      participantId: guestParticipantId(access()),
    });
    expect(asked.data).toEqual([]);

    const member = await listCommitteeTasks(
      workspaceId,
      access({ isGuest: false }),
      { view: 'all' }
    );
    expect(member.data.map(({ _id }) => _id).sort()).toEqual(
      [inTaskId, otherTaskId, standaloneTaskId].sort()
    );
  });

  it('opens a task only in a project the guest takes part in', async () => {
    await expect(
      assertTaskInWorkspace(access(), inTaskId)
    ).resolves.toMatchObject({ task: { _id: inTaskId } });
    await expect(
      assertTaskInWorkspace(access(), otherTaskId)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(
      assertTaskInWorkspace(access(), standaloneTaskId)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(
      assertTaskInWorkspace(access({ isGuest: false }), standaloneTaskId)
    ).resolves.toMatchObject({ task: { _id: standaloneTaskId } });
  });

  it('shows a guest only the people of their own projects', async () => {
    const ids = await getPeopleInProjectsOf(workspaceId, 'guest1');
    expect([...ids].sort()).toEqual(['guest1', 'member1']);

    const members = await getCommitteeProjectMembers(committee, ids);
    expect(members.map(({ personId }) => personId).sort()).toEqual([
      'guest1',
      'member1',
    ]);

    const everyone = await getCommitteeProjectMembers(committee);
    expect(everyone).toHaveLength(4);
  });

  it('shows a guest with no person nobody', async () => {
    const ids = await getPeopleInProjectsOf(workspaceId, null);
    expect(ids.size).toBe(0);
  });
});
