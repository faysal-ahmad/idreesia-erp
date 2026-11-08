import SimpleSchema from 'simpl-schema';

import { DmsAction, DmsEntityType } from 'meteor/idreesia-common/constants/dms';

import { identifiable } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  entityType: {
    type: String,
    allowedValues: Object.values(DmsEntityType),
  },
  entityId: {
    type: String,
  },
  documentId: {
    type: String,
    optional: true,
  },
  action: {
    type: String,
    allowedValues: Object.values(DmsAction),
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
