import { describe, expect, it } from 'vitest';

import { MeetingsWorkspaces } from 'meteor/idreesia-common/server/collections/meetings';

import { meetingsModule } from './module';

describe('meetingsModule', () => {
  it('is registered under the name "meetings"', () => {
    expect(meetingsModule.name).toBe('meetings');
  });

  it('creates a workspace and hands back its reference', async () => {
    const ref = await meetingsModule.createWorkspace({
      name: 'Committee Meetings',
      createdBy: 'u1',
      metadata: { committeeId: 'c1' },
    });

    expect(ref.module).toBe('meetings');
    const workspace = (await MeetingsWorkspaces.findOneAsync(ref.workspaceId)) as any;
    expect(workspace).toMatchObject({
      name: 'Committee Meetings',
      metadata: { committeeId: 'c1' },
      createdBy: 'u1',
    });
    expect(workspace.deletedAt).toBeUndefined();
  });

  it('archives a workspace by soft-deleting it', async () => {
    const ref = await meetingsModule.createWorkspace({ name: 'Meetings', createdBy: 'u1' });

    await meetingsModule.archiveWorkspace(ref, 'u2');

    const workspace = (await MeetingsWorkspaces.findOneAsync(ref.workspaceId)) as any;
    expect(workspace.deletedAt).toBeInstanceOf(Date);
    expect(workspace.deletedBy).toBe('u2');
  });

  it('has no membership to keep: adding and removing users does nothing', async () => {
    const ref = await meetingsModule.createWorkspace({ name: 'Meetings', createdBy: 'u1' });

    await expect(meetingsModule.addUser(ref, 'u2')).resolves.toBeUndefined();
    await expect(meetingsModule.removeUser(ref, 'u2')).resolves.toBeUndefined();
  });
});
