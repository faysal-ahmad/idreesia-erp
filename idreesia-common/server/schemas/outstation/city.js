import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  country: {
    type: String,
  },
  region: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
