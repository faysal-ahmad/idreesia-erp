import { PROJECTS_MODULE } from 'meteor/idreesia-common/constants/projects';
import type {
  HeadlessModule,
  WorkspaceRef,
} from 'meteor/idreesia-common/server/headless';

import { createProjectsWorkspace, deleteProjectsWorkspace } from './workspaces';

const toRef = (workspaceId: string): WorkspaceRef => ({
  module: PROJECTS_MODULE,
  workspaceId,
});

/**
 * The projects module as a headless module. It keeps no membership of its own
 * (callers decide who may use a workspace), so adding and removing users
 * does nothing.
 */
export const projectsModule: HeadlessModule = {
  name: PROJECTS_MODULE,

  async createWorkspace({ name, createdBy, metadata }) {
    const workspace = await createProjectsWorkspace({ name, metadata }, createdBy);
    return toRef(workspace._id);
  },

  async archiveWorkspace({ workspaceId }, userId) {
    await deleteProjectsWorkspace(workspaceId, userId);
  },

  async addUser() {
    // Nothing to do: this module keeps no membership.
  },

  async removeUser() {
    // Nothing to do: this module keeps no membership.
  },
};
