import { describe, expect, it, vi } from 'vitest';

import DmsWorkspaces from 'meteor/idreesia-common/server/collections/dms/workspaces';

import { dmsModule } from './module';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

describe('dmsModule', () => {
  it('is registered under the name "dms"', () => {
    expect(dmsModule.name).toBe('dms');
  });

  it('creates a workspace and hands back its reference', async () => {
    const ref = await dmsModule.createWorkspace({
      name: 'Committee Documents',
      createdBy: 'u1',
      metadata: { committeeId: 'c1' },
    });

    expect(ref.module).toBe('dms');
    const workspace = (await DmsWorkspaces.findOneAsync(ref.workspaceId)) as any;
    expect(workspace).toMatchObject({
      name: 'Committee Documents',
      metadata: { committeeId: 'c1' },
      createdBy: 'u1',
    });
    expect(workspace.deletedAt).toBeUndefined();
  });

  it('archives a workspace by soft-deleting it', async () => {
    const ref = await dmsModule.createWorkspace({ name: 'Docs', createdBy: 'u1' });

    await dmsModule.archiveWorkspace(ref, 'u2');

    const workspace = (await DmsWorkspaces.findOneAsync(ref.workspaceId)) as any;
    expect(workspace.deletedAt).toBeInstanceOf(Date);
    expect(workspace.deletedBy).toBe('u2');
  });

  it('has no membership to keep: adding and removing users does nothing', async () => {
    const ref = await dmsModule.createWorkspace({ name: 'Docs', createdBy: 'u1' });

    await expect(dmsModule.addUser(ref, 'u2')).resolves.toBeUndefined();
    await expect(dmsModule.removeUser(ref, 'u2')).resolves.toBeUndefined();
  });
});
