import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  moduleName: {
    type: String,
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
  instances: {
    type: Array,
    optional: true,
  },
  'instances.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
