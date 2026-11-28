import SimpleSchema from 'simpl-schema';

import {
  EMPLOYMENT_EVENT_TYPES,
  EXIT_REASONS,
} from 'meteor/idreesia-common/constants/hr/employment';

import { identifiable, timestamps } from '../common';

// One step in a person's employment history. Append-only.
export default new SimpleSchema({
  personId: {
    type: String,
  },
  eventType: {
    type: String,
    allowedValues: [...EMPLOYMENT_EVENT_TYPES],
  },
  effectiveDate: {
    type: Date,
  },
  // Set on `exited` events.
  exitReason: {
    type: String,
    allowedValues: [...EXIT_REASONS],
    optional: true,
  },
  // What changed, e.g. { fromJobId, toJobId } on `job-changed`.
  details: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  remarks: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
