import { Mongo } from 'meteor/mongo';

import { Attachment as AttachmentSchema } from 'meteor/idreesia-common/schemas/common';

class Attachments extends Mongo.Collection {
  constructor(name = 'common-attachments', options = {}) {
    const attachments = super(name, options);
    attachments.attachSchema(AttachmentSchema);
    return attachments;
  }
}

export default new Attachments();
