import SimpleSchema from 'simpl-schema';

import { ItemWithQuantityAndPrice } from './common';
import { approvable, identifiable, timestamps } from '../common';

export default new SimpleSchema({
  purchaseDate: {
    type: Date,
  },
  receivedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  purchasedBy: {
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
    type: ItemWithQuantityAndPrice,
  },
})
  .extend(approvable)
  .extend(identifiable)
  .extend(timestamps);
