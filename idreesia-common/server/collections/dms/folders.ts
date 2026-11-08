import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DmsFolder as Schema } from 'meteor/idreesia-common/server/schemas/dms';

import type { DmsFolderDocument } from './types';

class DmsFolders extends AggregatableCollection<DmsFolderDocument> {
  constructor(name = 'dms-folders', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DmsFolders();
