import SimpleSchema from 'simpl-schema';

import { DmsVersionStatus } from 'meteor/idreesia-common/constants/dms';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  documentId: {
    type: String,
  },
  // Set once the version is ready.
  versionNumber: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  status: {
    type: String,
    allowedValues: Object.values(DmsVersionStatus),
  },
  fileKey: {
    type: String,
  },
  fileName: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  // For a pending upload, the size the uploader declared.
  size: {
    type: SimpleSchema.Integer,
  },
  sha256: {
    type: String,
    optional: true,
  },
  etag: {
    type: String,
    optional: true,
  },
  comment: {
    type: String,
    optional: true,
  },
  restoredFromVersionId: {
    type: String,
    optional: true,
  },
  // Pending uploads only.
  uploadExpiresAt: {
    type: Date,
    optional: true,
  },
  // Pending upload of a new document: the document to create on completion.
  newDocument: {
    type: Object,
    optional: true,
    blackbox: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
