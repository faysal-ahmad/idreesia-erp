import { describe, expect, it } from 'vitest';

import { DutiesAttendanceWorkspaces } from 'meteor/idreesia-common/server/collections/duties-attendance';

import { dutiesAttendanceModule } from './module';

describe('dutiesAttendanceModule', () => {
  it('is registered under the name "duties-attendance"', () => {
    expect(dutiesAttendanceModule.name).toBe('duties-attendance');
  });

  it('creates a workspace and hands back its reference', async () => {
    const ref = await dutiesAttendanceModule.createWorkspace({
      name: 'Mehfil Duties',
      createdBy: 'u1',
      metadata: { locationId: 'l1' },
    });

    expect(ref.module).toBe('duties-attendance');
    const workspace = (await DutiesAttendanceWorkspaces.findOneAsync(
      ref.workspaceId
    )) as any;
    expect(workspace).toMatchObject({
      name: 'Mehfil Duties',
      metadata: { locationId: 'l1' },
      createdBy: 'u1',
    });
    expect(workspace.deletedAt).toBeUndefined();
  });

  it('archives a workspace by soft-deleting it', async () => {
    const ref = await dutiesAttendanceModule.createWorkspace({
      name: 'Duties',
      createdBy: 'u1',
    });

    await dutiesAttendanceModule.archiveWorkspace(ref, 'u2');

    const workspace = (await DutiesAttendanceWorkspaces.findOneAsync(
      ref.workspaceId
    )) as any;
    expect(workspace.deletedAt).toBeInstanceOf(Date);
    expect(workspace.deletedBy).toBe('u2');
  });

  it('manages its users itself: the generic hooks do nothing', async () => {
    const ref = await dutiesAttendanceModule.createWorkspace({
      name: 'Duties',
      createdBy: 'u1',
    });

    await expect(dutiesAttendanceModule.addUser(ref, 'u2')).resolves.toBeUndefined();
    await expect(dutiesAttendanceModule.removeUser(ref, 'u2')).resolves.toBeUndefined();
  });
});
