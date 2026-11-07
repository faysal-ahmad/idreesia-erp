import { Mongo } from 'meteor/mongo';

import { Attachment as AttachmentSchema } from 'meteor/idreesia-common/server/schemas/common';
import { deleteFile } from 'meteor/idreesia-common/server/file-storage';

interface AttachmentDocument {
  _id?: string;
  name?: string;
  description?: string;
  mimeType: string;
  data?: string;
  fileKey?: string;
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

  /** Deletes an attachment and its file in object storage, if it has one. */
  async removeAttachment(attachmentId: string): Promise<void> {
    const attachment = await this.findOneAsync(attachmentId);
    if (attachment?.fileKey) {
      try {
        await deleteFile(attachment.fileKey);
      } catch (error) {
        // An orphaned file is harmless; failing the removal over it is not.
        // eslint-disable-next-line no-console
        console.error(
          `Failed to delete attachment file ${attachment.fileKey}:`,
          error
        );
      }
    }
    await this.removeAsync(attachmentId);
  }
}

export default new Attachments();
