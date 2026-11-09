import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DiscussionsWorkspace as Schema } from 'meteor/idreesia-common/server/schemas/discussions';

import type { DiscussionsWorkspaceDocument } from './types';

class DiscussionsWorkspaces extends AggregatableCollection<DiscussionsWorkspaceDocument> {
  constructor(name = 'discussions-workspaces', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DiscussionsWorkspaces();
