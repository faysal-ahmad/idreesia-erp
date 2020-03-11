import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  revisionNumber: {
    type: Number,
    optional: true,
  },
  revisionDate: {
    type: Date,
    optional: true,
  },
  imageIds: {
    type: Array,
    optional: true,
  },
  'imageIds.$': {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
