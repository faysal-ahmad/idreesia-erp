import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  metadata: {
    type: Object,
    optional: true,
    blackbox: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
