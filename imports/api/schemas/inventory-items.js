import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String
  },
  category: {
    type: String,
    allowedValues: ['Electrical', 'Sanitary Wares']
  },
  minStockLevel: {
    type: Number,
    optional: true
  },
  currentStockLevel: {
    type: Number
  }
})
  .extend(identifiable)
  .extend(timestamps);
