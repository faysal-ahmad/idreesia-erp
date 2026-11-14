import { describe, expect, it } from 'vitest';

import { ProjectsWorkspaces } from 'meteor/idreesia-common/server/collections/projects';

import { projectsModule } from './module';

describe('projectsModule', () => {
  it('is registered under the name "projects"', () => {
    expect(projectsModule.name).toBe('projects');
  });

  it('creates a workspace and hands back its reference', async () => {
    const ref = await projectsModule.createWorkspace({
      name: 'Committee Projects',
      createdBy: 'u1',
      metadata: { committeeId: 'c1' },
    });

    expect(ref.module).toBe('projects');
    const workspace = (await ProjectsWorkspaces.findOneAsync(ref.workspaceId)) as any;
    expect(workspace).toMatchObject({
      name: 'Committee Projects',
      metadata: { committeeId: 'c1' },
      createdBy: 'u1',
    });
    expect(workspace.deletedAt).toBeUndefined();
  });

  it('archives a workspace by soft-deleting it', async () => {
    const ref = await projectsModule.createWorkspace({ name: 'Projects', createdBy: 'u1' });

    await projectsModule.archiveWorkspace(ref, 'u2');

    const workspace = (await ProjectsWorkspaces.findOneAsync(ref.workspaceId)) as any;
    expect(workspace.deletedAt).toBeInstanceOf(Date);
    expect(workspace.deletedBy).toBe('u2');
  });

  it('has no membership to keep: adding and removing users does nothing', async () => {
    const ref = await projectsModule.createWorkspace({ name: 'Projects', createdBy: 'u1' });

    await expect(projectsModule.addUser(ref, 'u2')).resolves.toBeUndefined();
    await expect(projectsModule.removeUser(ref, 'u2')).resolves.toBeUndefined();
  });
});
