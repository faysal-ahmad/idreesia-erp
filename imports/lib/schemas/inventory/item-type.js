import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  itemCategoryId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  unitOfMeasurement: {
    type: String,
    allowedValues: ['quantity', 'ft', 'm', 'kg', 'lbs'],
  },
  singleUse: {
    type: Boolean,
  },
  picture: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
