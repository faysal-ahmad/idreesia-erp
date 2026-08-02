import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  physicalStoreId: {
    type: String,
  },
  name: {
    type: String,
  },
  company: {
    type: String,
    optional: true,
  },
  details: {
    type: String,
    optional: true,
  },
  categoryId: {
    type: String,
  },
  unitOfMeasurement: {
    type: String,
    allowedValues: ['quantity', 'ft', 'm', 'kg', 'lbs', 'l'],
  },
  imageId: {
    type: String,
    optional: true,
  },
  startingStockLevel: {
    type: Number,
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
  verifiedOn: {
    type: Date,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
