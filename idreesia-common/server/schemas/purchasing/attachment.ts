import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  ownerType: { type: String },
  ownerId: { type: String },
  name: { type: String },
  fileName: { type: String },
  mimeType: { type: String },
  size: { type: SimpleSchema.Integer, min: 0 },
  fileKey: { type: String },
  status: { type: String },
  uploadExpiresAt: { type: Date, optional: true },
})
  .extend(identifiable)
  .extend(timestamps);
