import { DMS_MODULE } from 'meteor/idreesia-common/constants/dms';
import type {
  HeadlessModule,
  WorkspaceRef,
} from 'meteor/idreesia-common/server/headless';

import { createWorkspace, deleteWorkspace } from './workspaces';

const toRef = (workspaceId: string): WorkspaceRef => ({
  module: DMS_MODULE,
  workspaceId,
});

/**
 * The DMS as a headless module. The DMS has no members of its own (callers
 * decide who may use a workspace), so adding and removing users does
 * nothing.
 */
export const dmsModule: HeadlessModule = {
  name: DMS_MODULE,

  async createWorkspace({ name, createdBy, metadata }) {
    const workspace = await createWorkspace({ name, metadata }, createdBy);
    return toRef(workspace._id);
  },

  async archiveWorkspace({ workspaceId }, userId) {
    await deleteWorkspace(workspaceId, userId);
  },

  async addUser() {
    // Nothing to do: the DMS keeps no membership.
  },

  async removeUser() {
    // Nothing to do: the DMS keeps no membership.
  },
};
