import SimpleSchema from 'simpl-schema';

import {
  MeetingsAction,
  MeetingsEntityType,
} from 'meteor/idreesia-common/constants/meetings';

import { identifiable } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  // Unset for workspace-level entries.
  meetingId: {
    type: String,
    optional: true,
  },
  entityType: {
    type: String,
    allowedValues: Object.values(MeetingsEntityType),
  },
  entityId: {
    type: String,
  },
  action: {
    type: String,
    allowedValues: Object.values(MeetingsAction),
  },
  userId: {
    type: String,
  },
  at: {
    type: Date,
  },
  details: {
    type: Object,
    optional: true,
    blackbox: true,
  },
}).extend(identifiable);
