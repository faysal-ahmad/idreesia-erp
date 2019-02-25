import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  companyId: {
    type: String,
  },
  name: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  type: {
    type: String,
    optional: true,
  },
  nature: {
    type: String,
    optional: true,
  },
  number: {
    type: String,
  },
  parent: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
