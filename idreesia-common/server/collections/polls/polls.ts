import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Poll as Schema } from 'meteor/idreesia-common/server/schemas/polls';

import type { PollDocument } from './types';

class Polls extends AggregatableCollection<PollDocument> {
  constructor(name = 'polls', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new Polls();
