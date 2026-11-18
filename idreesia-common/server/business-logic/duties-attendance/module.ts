import { DUTIES_ATTENDANCE_MODULE } from 'meteor/idreesia-common/constants/duties-attendance';
import type {
  HeadlessModule,
  WorkspaceRef,
} from 'meteor/idreesia-common/server/headless';

import {
  createDutiesAttendanceWorkspace,
  deleteDutiesAttendanceWorkspace,
} from './workspaces';

const toRef = (workspaceId: string): WorkspaceRef => ({
  module: DUTIES_ATTENDANCE_MODULE,
  workspaceId,
});

/**
 * The duties and attendance module as a headless module. Its workspace users
 * are managed through the module's own functions (from the location's admin
 * page), so the generic add and remove user hooks do nothing.
 */
export const dutiesAttendanceModule: HeadlessModule = {
  name: DUTIES_ATTENDANCE_MODULE,

  async createWorkspace({ name, createdBy, metadata }) {
    const workspace = await createDutiesAttendanceWorkspace(
      { name, metadata },
      createdBy
    );
    return toRef(workspace._id);
  },

  async archiveWorkspace({ workspaceId }, userId) {
    await deleteDutiesAttendanceWorkspace(workspaceId, userId);
  },

  async addUser() {
    // Nothing to do: users are managed by the module's own functions.
  },

  async removeUser() {
    // Nothing to do: users are managed by the module's own functions.
  },
};
