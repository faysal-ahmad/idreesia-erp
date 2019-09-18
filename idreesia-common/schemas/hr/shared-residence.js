import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  address: {
    type: String,
  },
  ownerKarkunId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
