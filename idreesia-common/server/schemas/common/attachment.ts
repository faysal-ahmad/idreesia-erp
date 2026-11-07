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
  // Legacy base64 content. Files stored in object storage have fileKey
  // instead, and data is removed once the copy is confirmed.
  data: {
    type: String,
    optional: true,
  },
  fileKey: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
