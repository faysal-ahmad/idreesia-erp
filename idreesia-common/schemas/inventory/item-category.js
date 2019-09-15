import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  physicalStoreId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
})
  .extend(identifiable)
  .extend(timestamps);
