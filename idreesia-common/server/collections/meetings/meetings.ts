import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Meeting as Schema } from 'meteor/idreesia-common/server/schemas/meetings';

import type { MeetingDocument } from './types';

class Meetings extends AggregatableCollection<MeetingDocument> {
  constructor(name = 'meetings', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new Meetings();
