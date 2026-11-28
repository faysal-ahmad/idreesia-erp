import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

// A shift of a job (e.g. "Morning 08:00–14:00"). Optional: a job may have none.
export default new SimpleSchema({
  name: {
    type: String,
  },
  jobId: {
    type: String,
  },
  startTime: {
    type: String,
    optional: true,
  },
  endTime: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
