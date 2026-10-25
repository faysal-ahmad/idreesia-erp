import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

// Mirror of a security-server VideoFeedSource. The server's connection config
// (RTSP host and credentials) is deliberately never synced.
export default new SimpleSchema({
  externalId: {
    type: String,
  },
  name: {
    type: String,
  },
  enabled: {
    type: Boolean,
  },
  similarityThreshold: {
    type: Number,
    optional: true,
  },
  recognitionFps: {
    type: Number,
  },
})
  .extend(identifiable)
  .extend(timestamps);
