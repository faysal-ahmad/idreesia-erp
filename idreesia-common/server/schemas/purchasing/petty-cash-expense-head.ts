import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: { type: String },
  description: { type: String, optional: true },
  isActive: { type: Boolean },
  version: { type: SimpleSchema.Integer },
})
  .extend(identifiable)
  .extend(timestamps);
