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
  // Key of the file in object storage.
  fileKey: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
