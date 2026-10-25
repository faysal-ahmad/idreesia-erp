import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  color: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  members: {
    type: Array,
    optional: true,
  },
  'members.$': {
    type: Object,
  },
  'members.$.karkunId': {
    type: String,
  },
  'members.$.isCoordinator': {
    type: Boolean,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
