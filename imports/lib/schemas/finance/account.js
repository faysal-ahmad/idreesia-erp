import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  startingBalance: {
    type: Number,
  },
  currentBalance: {
    type: Number,
  },
})
  .extend(identifiable)
  .extend(timestamps);
