import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  address: {
    type: String,
    optional: true,
  },
  ownerId: {
    type: String,
    optional: true,
  },
  attachmentIds: {
    type: Array,
    optional: true,
  },
  'attachmentIds.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
