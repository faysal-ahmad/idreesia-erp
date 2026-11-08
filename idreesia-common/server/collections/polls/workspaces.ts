import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PollsWorkspace as Schema } from 'meteor/idreesia-common/server/schemas/polls';

import type { PollsWorkspaceDocument } from './types';

class PollsWorkspaces extends AggregatableCollection<PollsWorkspaceDocument> {
  constructor(name = 'polls-workspaces', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PollsWorkspaces();
