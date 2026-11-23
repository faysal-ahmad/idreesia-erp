import SimpleSchema from 'simpl-schema';

import { identifiable } from '../common';

// One document per (type, year); `seq` is the last number handed out.
export default new SimpleSchema({
  type: { type: String },
  year: { type: SimpleSchema.Integer },
  seq: { type: SimpleSchema.Integer },
}).extend(identifiable);
