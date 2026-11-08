import SimpleSchema from 'simpl-schema';

import {
  PollsAction,
  PollsEntityType,
} from 'meteor/idreesia-common/constants/polls';

import { identifiable } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  // Unset for workspace-level entries.
  pollId: {
    type: String,
    optional: true,
  },
  entityType: {
    type: String,
    allowedValues: Object.values(PollsEntityType),
  },
  entityId: {
    type: String,
  },
  action: {
    type: String,
    allowedValues: Object.values(PollsAction),
  },
  userId: {
    type: String,
  },
  at: {
    type: Date,
  },
  // Never holds a voter's answers.
  details: {
    type: Object,
    optional: true,
    blackbox: true,
  },
}).extend(identifiable);
