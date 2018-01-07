import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String
  },
  address: {
    type: String,
    optional: true
  }
})
  .extend(identifiable)
  .extend(timestamps);
