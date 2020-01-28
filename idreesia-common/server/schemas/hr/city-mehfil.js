import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  cityId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  address: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
