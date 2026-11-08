import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { MeetingActionItem as Schema } from 'meteor/idreesia-common/server/schemas/meetings';

import type { MeetingActionItemDocument } from './types';

class MeetingActionItems extends AggregatableCollection<MeetingActionItemDocument> {
  constructor(name = 'meetings-action-items', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new MeetingActionItems();
