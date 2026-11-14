import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  // Unset for a document at the workspace root.
  folderId: {
    type: String,
    optional: true,
  },
  name: {
    type: String,
  },
  // Lower-cased name, for case-insensitive uniqueness within a folder.
  nameLower: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  tags: {
    type: Array,
  },
  'tags.$': {
    type: String,
  },
  metadata: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // Number of version numbers handed out so far.
  versionCount: {
    type: SimpleSchema.Integer,
  },
  currentVersionId: {
    type: String,
    optional: true,
  },
  currentVersionNumber: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  // Copied from the current version.
  fileName: {
    type: String,
    optional: true,
  },
  mimeType: {
    type: String,
    optional: true,
  },
  size: {
    type: SimpleSchema.Integer,
    optional: true,
  },
  lock: {
    type: Object,
    optional: true,
  },
  'lock.userId': {
    type: String,
  },
  'lock.lockedAt': {
    type: Date,
  },
  'lock.expiresAt': {
    type: Date,
  },
  'lock.note': {
    type: String,
    optional: true,
  },
  trashed: {
    type: Boolean,
  },
  // Id of the item whose trashing trashed this one (itself, or a folder).
  trashRootId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
