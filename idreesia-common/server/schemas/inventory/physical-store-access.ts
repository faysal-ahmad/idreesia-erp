import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  physicalStoreId: {
    type: String,
  },
  // Who holds the permissions: a user, or a user group (every member of the
  // group holds them).
  subjectType: {
    type: String,
    allowedValues: ['user', 'group'],
  },
  subjectId: {
    type: String,
  },
  // What the subject may do on this store, as the `stores-*` permission values.
  permissions: {
    type: Array,
  },
  'permissions.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
