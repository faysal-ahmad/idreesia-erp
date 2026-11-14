import { POLLS_MODULE } from 'meteor/idreesia-common/constants/polls';
import type {
  HeadlessModule,
  WorkspaceRef,
} from 'meteor/idreesia-common/server/headless';

import { createPollsWorkspace, deletePollsWorkspace } from './workspaces';

const toRef = (workspaceId: string): WorkspaceRef => ({
  module: POLLS_MODULE,
  workspaceId,
});

/**
 * The polls module as a headless module. It keeps no membership of its own
 * (callers decide who may use a workspace), so adding and removing users
 * does nothing.
 */
export const pollsModule: HeadlessModule = {
  name: POLLS_MODULE,

  async createWorkspace({ name, createdBy, metadata }) {
    const workspace = await createPollsWorkspace({ name, metadata }, createdBy);
    return toRef(workspace._id);
  },

  async archiveWorkspace({ workspaceId }, userId) {
    await deletePollsWorkspace(workspaceId, userId);
  },

  async addUser() {
    // Nothing to do: this module keeps no membership.
  },

  async removeUser() {
    // Nothing to do: this module keeps no membership.
  },
};
