import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PollBallot as Schema } from 'meteor/idreesia-common/server/schemas/polls';

import type { PollBallotDocument } from './types';

class PollBallots extends AggregatableCollection<PollBallotDocument> {
  constructor(name = 'polls-ballots', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PollBallots();
