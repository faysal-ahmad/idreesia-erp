import SimpleSchema from 'simpl-schema';
import { values } from 'meteor/idreesia-common/utilities/lodash';

import { identifiable, timestamps } from '../common';
import { PaymentType } from 'meteor/idreesia-common/constants/accounts';

export default new SimpleSchema({
  name: {
    type: String,
  },
  fatherName: {
    type: String,
  },
  cnicNumber: {
    type: String,
  },
  contactNumber: {
    type: String,
    optional: true,
  },
  paymentNumber: {
    type: Number,
  },
  paymentType: {
    type: String,
    allowedValues: values(PaymentType),
  },
  paymentAmount: {
    type: Number,
  },
  paymentDate: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
  },
  description: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
