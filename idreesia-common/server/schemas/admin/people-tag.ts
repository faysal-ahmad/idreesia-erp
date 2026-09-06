import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  color: {
    type: String,
  },
  textColor: {
    type: String,
  },
  moduleNames: {
    type: Array,
  },
  'moduleNames.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
