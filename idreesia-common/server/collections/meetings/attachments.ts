import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { MeetingAttachment as Schema } from 'meteor/idreesia-common/server/schemas/meetings';

import type { MeetingAttachmentDocument } from './types';

class MeetingAttachments extends AggregatableCollection<MeetingAttachmentDocument> {
  constructor(name = 'meetings-attachments', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new MeetingAttachments();
