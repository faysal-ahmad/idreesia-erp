import SimpleSchema from 'simpl-schema';

import { ItemWithQuantity } from './common';
import { approvable, identifiable, timestamps } from '../common';

export default new SimpleSchema({
  issueDate: {
    type: Date,
  },
  issuedBy: {
    type: String,
  },
  issuedTo: {
    type: String,
  },
  handedOverTo: {
    type: String,
    optional: true,
  },
  locationId: {
    type: String,
    optional: true,
  },
  physicalStoreId: {
    type: String,
  },
  items: {
    type: Array,
  },
  'items.$': {
    type: ItemWithQuantity,
  },
  notes: {
    type: String,
    optional: true,
  },
})
  .extend(approvable)
  .extend(identifiable)
  .extend(timestamps);
