import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DmsDocumentVersion as Schema } from 'meteor/idreesia-common/server/schemas/dms';

import type { DmsDocumentVersionDocument } from './types';

class DmsDocumentVersions extends AggregatableCollection<DmsDocumentVersionDocument> {
  constructor(name = 'dms-document-versions', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DmsDocumentVersions();
