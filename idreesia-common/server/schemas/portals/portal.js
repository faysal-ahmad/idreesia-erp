import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  cityIds: {
    type: Array,
    optional: true,
  },
  'cityIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
})
  .extend(identifiable)
  .extend(timestamps);
