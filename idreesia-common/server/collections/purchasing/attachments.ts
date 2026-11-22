import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingAttachment as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingAttachmentDocument } from './types';

class PurchasingAttachments extends AggregatableCollection<PurchasingAttachmentDocument> {
  constructor(name = 'purchasing-attachments', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingAttachments();
