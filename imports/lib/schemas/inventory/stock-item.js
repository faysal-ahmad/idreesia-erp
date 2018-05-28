import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  itemTypeId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  physicalStoreId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  minStockLevel: {
    type: Number,
    optional: true,
  },
  currentStockLevel: {
    type: Number,
  },
  totalStockLevel: {
    type: Number,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
