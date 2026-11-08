import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { MeetingsWorkspace as Schema } from 'meteor/idreesia-common/server/schemas/meetings';

import type { MeetingsWorkspaceDocument } from './types';

class MeetingsWorkspaces extends AggregatableCollection<MeetingsWorkspaceDocument> {
  constructor(name = 'meetings-workspaces', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new MeetingsWorkspaces();
