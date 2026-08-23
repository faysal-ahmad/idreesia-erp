import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  displayName: {
    type: String,
  },
  defaultSchedule: {
    type: String,
    optional: true,
  },
  schedule: {
    type: String,
    optional: true,
  },
  enabled: {
    type: Boolean,
  },
})
  .extend(identifiable)
  .extend(timestamps);
