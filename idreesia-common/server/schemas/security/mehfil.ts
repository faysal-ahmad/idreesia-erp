import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  mehfilDate: {
    type: Date,
  },
})
  .extend(identifiable)
  .extend(timestamps);
