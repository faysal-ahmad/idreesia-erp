import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  itemTypeId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  physicalStoreId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  minStockLevel: {
    type: Number
  },
  currentStockLevel: {
    type: Number
  }
})
  .extend(identifiable)
  .extend(timestamps);
