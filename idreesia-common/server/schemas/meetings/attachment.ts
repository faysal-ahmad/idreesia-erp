import SimpleSchema from 'simpl-schema';

import { MeetingAttachmentStatus } from 'meteor/idreesia-common/constants/meetings';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  meetingId: {
    type: String,
  },
  // Display name; defaults to the file name.
  name: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  fileName: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  size: {
    type: SimpleSchema.Integer,
    min: 0,
  },
  fileKey: {
    type: String,
  },
  sha256: {
    type: String,
    optional: true,
  },
  etag: {
    type: String,
    optional: true,
  },
  status: {
    type: String,
    allowedValues: Object.values(MeetingAttachmentStatus),
  },
  // Pending direct uploads only.
  uploadExpiresAt: {
    type: Date,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
