import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  importTransactions: {
    type: Boolean,
  },
  connectivitySettings: {
    type: Object,
    blackbox: true,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
