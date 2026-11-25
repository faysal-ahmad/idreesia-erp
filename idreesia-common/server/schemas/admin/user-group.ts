import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  moduleName: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  permissions: {
    type: Array,
    optional: true,
  },
  'permissions.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
