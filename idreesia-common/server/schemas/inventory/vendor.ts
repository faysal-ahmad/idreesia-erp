import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  physicalStoreId: {
    type: String,
  },
  contactPerson: {
    type: String,
    optional: true,
  },
  contactNumber: {
    type: String,
    optional: true,
  },
  address: {
    type: String,
    optional: true,
  },
  notes: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
