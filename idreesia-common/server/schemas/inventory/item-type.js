import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  externalReferenceId: {
    type: String,
    optional: true,
  },
  name: {
    type: String,
  },
  urduName: {
    type: String,
    optional: true,
  },
  company: {
    type: String,
    optional: true,
  },
  details: {
    type: String,
    optional: true,
  },
  itemCategoryId: {
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
})
  .extend(identifiable)
  .extend(timestamps);
