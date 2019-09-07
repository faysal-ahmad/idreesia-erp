import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  physicalStoreId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
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
    regEx: SimpleSchema.RegEx.Id,
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
})
  .extend(identifiable)
  .extend(timestamps);
