import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  peripheryOf: {
    type: String,
    optional: true,
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
