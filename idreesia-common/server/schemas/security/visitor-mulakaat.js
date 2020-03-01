import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  visitorId: {
    type: String,
  },
  mulakaatDate: {
    type: Date,
  },
  cancelledDate: {
    type: Date,
    optional: true,
  },
  cancelledBy: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
