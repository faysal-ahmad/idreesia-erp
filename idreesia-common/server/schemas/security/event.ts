import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  eventDate: {
    type: Date,
  },
})
  .extend(identifiable)
  .extend(timestamps);
