import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from './';

export default new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  mimeType: {
    type: String,
  },
  data: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
