import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  metadata: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  settings: {
    type: Object,
    optional: true,
  },
  'settings.maxFileSize': {
    type: SimpleSchema.Integer,
    optional: true,
    min: 1,
  },
  'settings.allowedMimeTypes': {
    type: Array,
    optional: true,
  },
  'settings.allowedMimeTypes.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
