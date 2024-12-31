import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  type: {
    type: String,
    allowedValues: ['Mehfil', 'City', 'Country', 'Other'],
  },
  parentId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
