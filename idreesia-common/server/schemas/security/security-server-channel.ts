import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

// RTSP connection details the security server needs to open the camera feed.
// The password is only ever handed to the security server's sync endpoint -
// never returned through GraphQL.
export const SecurityServerChannelConnection = new SimpleSchema({
  host: {
    type: String,
  },
  port: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  path: {
    type: String,
    optional: true,
  },
  username: {
    type: String,
    optional: true,
  },
  password: {
    type: String,
    optional: true,
  },
});

// A camera feed the security server watches. Editable in both the ERP and the
// security server, and kept in step by the security server's two-way sync.
export default new SimpleSchema({
  // The security server's id for this channel. Unset until the security server
  // has received it.
  externalId: {
    type: String,
    optional: true,
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
  connection: {
    type: SecurityServerChannelConnection,
  },
})
  .extend(identifiable)
  .extend(timestamps);
