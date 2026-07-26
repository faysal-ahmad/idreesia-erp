import { Mongo } from 'meteor/mongo';

import { Attachment as AttachmentSchema } from 'meteor/idreesia-common/server/schemas/common';
import { RemovedAttachments } from 'meteor/idreesia-common/server/collections/common';

interface AttachmentDocument {
  _id?: string;
  name?: string;
  description?: string;
  mimeType: string;
  data: string;
}

class Attachments extends Mongo.Collection<AttachmentDocument> {
  constructor(
    name = 'common-attachments',
    options: Mongo.CollectionOptions<AttachmentDocument> = {}
  ) {
    super(name, options);
    this.attachSchema(AttachmentSchema);
  }

  async removeAttachment(attachmentId: string): Promise<void> {
    const attachment = await this.findOneAsync(attachmentId);
    await RemovedAttachments.insertAsync(attachment as AttachmentDocument);
    await this.removeAsync(attachmentId);
  }
}

export default new Attachments();
