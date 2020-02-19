import SimpleSchema from 'simpl-schema';

import { identifiable } from '../common';

export default new SimpleSchema({
  visitorId: {
    type: String,
  },
  mulakaatDate: {
    type: Date,
  },
}).extend(identifiable);
