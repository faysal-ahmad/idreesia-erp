import { Mongo } from 'meteor/mongo';

import { Attachment as AttachmentSchema } from 'meteor/idreesia-common/server/schemas/common';

export interface AttachmentDocument {
  _id?: string;
  name?: string;
  description?: string;
  mimeType: string;
  fileKey: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

class Attachments extends Mongo.Collection<AttachmentDocument> {
  constructor(
    name = 'common-attachments',
    options: Mongo.CollectionOptions<AttachmentDocument> = {}
  ) {
    super(name, options);
    this.attachSchema(AttachmentSchema);
  }
}

export default new Attachments();
