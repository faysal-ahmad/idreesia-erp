import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  color: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  karkunIds: {
    type: Array,
    optional: true,
  },
  'karkunIds.$': {
    type: String,
  },
  coordinatorKarkunId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
