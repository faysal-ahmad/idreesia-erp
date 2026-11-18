import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DutiesAttendanceWorkspace as Schema } from 'meteor/idreesia-common/server/schemas/duties-attendance';

import type { DutiesAttendanceWorkspaceDocument } from './types';

class DutiesAttendanceWorkspaces extends AggregatableCollection<DutiesAttendanceWorkspaceDocument> {
  constructor(name = 'duties-attendance-workspaces', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DutiesAttendanceWorkspaces();
