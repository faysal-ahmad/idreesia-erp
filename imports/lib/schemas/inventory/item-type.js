import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  categoryId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  storeId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  singleUse: {
    type: Boolean
  }
})
  .extend(identifiable)
  .extend(timestamps);
