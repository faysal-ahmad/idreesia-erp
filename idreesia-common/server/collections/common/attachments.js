import { Mongo } from 'meteor/mongo';

import { Attachment as AttachmentSchema } from 'meteor/idreesia-common/server/schemas/common';
import { RemovedAttachments } from 'meteor/idreesia-common/server/collections/common';

class Attachments extends Mongo.Collection {
  constructor(name = 'common-attachments', options = {}) {
    const attachments = super(name, options);
    attachments.attachSchema(AttachmentSchema);
    return attachments;
  }

  async removeAttachment(attachmentId) {
    const attachment = await this.findOneAsync(attachmentId);
    await RemovedAttachments.insertAsync(attachment);
    await this.removeAsync(attachmentId);
  }
}

export default new Attachments();
