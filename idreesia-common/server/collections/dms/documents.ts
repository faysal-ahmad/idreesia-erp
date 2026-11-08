import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DmsDocument as Schema } from 'meteor/idreesia-common/server/schemas/dms';

import type { DmsDocumentDocument } from './types';

class DmsDocuments extends AggregatableCollection<DmsDocumentDocument> {
  constructor(name = 'dms-documents', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DmsDocuments();
