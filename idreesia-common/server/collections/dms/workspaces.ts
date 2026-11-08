import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DmsWorkspace as Schema } from 'meteor/idreesia-common/server/schemas/dms';

import type { DmsWorkspaceDocument } from './types';

class DmsWorkspaces extends AggregatableCollection<DmsWorkspaceDocument> {
  constructor(name = 'dms-workspaces', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DmsWorkspaces();
