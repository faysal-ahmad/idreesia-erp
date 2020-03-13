import { Mongo } from 'meteor/mongo';

import { Attachment as AttachmentSchema } from 'meteor/idreesia-common/server/schemas/common';

class RemovedAttachments extends Mongo.Collection {
  constructor(name = 'common-removed-attachments', options = {}) {
    const removedAttachments = super(name, options);
    removedAttachments.attachSchema(AttachmentSchema);
    return removedAttachments;
  }
}

export default new RemovedAttachments();
