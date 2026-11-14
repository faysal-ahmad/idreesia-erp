import { describe, expect, it } from 'vitest';

import { PollsWorkspaces } from 'meteor/idreesia-common/server/collections/polls';

import { pollsModule } from './module';

describe('pollsModule', () => {
  it('is registered under the name "polls"', () => {
    expect(pollsModule.name).toBe('polls');
  });

  it('creates a workspace and hands back its reference', async () => {
    const ref = await pollsModule.createWorkspace({
      name: 'Committee Polls',
      createdBy: 'u1',
      metadata: { committeeId: 'c1' },
    });

    expect(ref.module).toBe('polls');
    const workspace = (await PollsWorkspaces.findOneAsync(ref.workspaceId)) as any;
    expect(workspace).toMatchObject({
      name: 'Committee Polls',
      metadata: { committeeId: 'c1' },
      createdBy: 'u1',
    });
    expect(workspace.deletedAt).toBeUndefined();
  });

  it('archives a workspace by soft-deleting it', async () => {
    const ref = await pollsModule.createWorkspace({ name: 'Polls', createdBy: 'u1' });

    await pollsModule.archiveWorkspace(ref, 'u2');

    const workspace = (await PollsWorkspaces.findOneAsync(ref.workspaceId)) as any;
    expect(workspace.deletedAt).toBeInstanceOf(Date);
    expect(workspace.deletedBy).toBe('u2');
  });

  it('has no membership to keep: adding and removing users does nothing', async () => {
    const ref = await pollsModule.createWorkspace({ name: 'Polls', createdBy: 'u1' });

    await expect(pollsModule.addUser(ref, 'u2')).resolves.toBeUndefined();
    await expect(pollsModule.removeUser(ref, 'u2')).resolves.toBeUndefined();
  });
});
