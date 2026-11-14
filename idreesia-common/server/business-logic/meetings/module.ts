import { MEETINGS_MODULE } from 'meteor/idreesia-common/constants/meetings';
import type {
  HeadlessModule,
  WorkspaceRef,
} from 'meteor/idreesia-common/server/headless';

import { createMeetingsWorkspace, deleteMeetingsWorkspace } from './workspaces';

const toRef = (workspaceId: string): WorkspaceRef => ({
  module: MEETINGS_MODULE,
  workspaceId,
});

/**
 * The meetings module as a headless module. It keeps no membership of its own
 * (callers decide who may use a workspace), so adding and removing users
 * does nothing.
 */
export const meetingsModule: HeadlessModule = {
  name: MEETINGS_MODULE,

  async createWorkspace({ name, createdBy, metadata }) {
    const workspace = await createMeetingsWorkspace({ name, metadata }, createdBy);
    return toRef(workspace._id);
  },

  async archiveWorkspace({ workspaceId }, userId) {
    await deleteMeetingsWorkspace(workspaceId, userId);
  },

  async addUser() {
    // Nothing to do: this module keeps no membership.
  },

  async removeUser() {
    // Nothing to do: this module keeps no membership.
  },
};
