import { Mongo } from 'meteor/mongo';

import { Attachment as AttachmentSchema } from 'meteor/idreesia-common/server/schemas/common';

interface AttachmentDocument {
  _id?: string;
  name?: string;
  description?: string;
  mimeType: string;
  data: string;
}

class RemovedAttachments extends Mongo.Collection<AttachmentDocument> {
  constructor(
    name = 'common-removed-attachments',
    options: Mongo.CollectionOptions<AttachmentDocument> = {}
  ) {
    super(name, options);
    this.attachSchema(AttachmentSchema);
  }
}

export default new RemovedAttachments();
