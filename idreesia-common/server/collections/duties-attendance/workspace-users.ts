import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DutiesAttendanceWorkspaceUser as Schema } from 'meteor/idreesia-common/server/schemas/duties-attendance';

import type { DutiesAttendanceWorkspaceUserDocument } from './types';

class DutiesAttendanceWorkspaceUsers extends AggregatableCollection<DutiesAttendanceWorkspaceUserDocument> {
  constructor(name = 'duties-attendance-workspace-users', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DutiesAttendanceWorkspaceUsers();
