import SimpleSchema from 'simpl-schema';

import { ItemWithQuantity } from './common';
import { approvable, identifiable, timestamps } from '../common';

export default new SimpleSchema({
  issueDate: {
    type: Date,
  },
  issuedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  issuedTo: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  physicalStoreId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  items: {
    type: Array,
  },
  'items.$': {
    type: ItemWithQuantity,
  },
})
  .extend(approvable)
  .extend(identifiable)
  .extend(timestamps);
