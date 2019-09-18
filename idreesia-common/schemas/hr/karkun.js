import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  // Points to login account if one exists for this karkun
  userId: {
    type: String,
    optional: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
    optional: true,
  },
  ehadDate: {
    type: Date,
    optional: true,
  },
  cnicNumber: {
    type: String,
    optional: true,
  },
  address: {
    type: String,
    optional: true,
  },
  city: {
    type: String,
    optional: true,
  },
  country: {
    type: String,
    optional: true,
  },
  sharedResidenceId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  contactNumber1: {
    type: String,
    optional: true,
  },
  contactNumber2: {
    type: String,
    optional: true,
  },
  emailAddress: {
    type: String,
    optional: true,
  },
  bloodGroup: {
    type: String,
    optional: true,
  },
  educationalQualification: {
    type: String,
    optional: true,
  },
  meansOfEarning: {
    type: String,
    optional: true,
  },
  imageId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  attachmentIds: {
    type: Array,
    optional: true,
  },
  'attachmentIds.$': {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  isEmployee: {
    type: Boolean,
    optional: true,
  },
  jobId: {
    type: String,
    optional: true,
  },
  employmentStartDate: {
    type: Date,
    optional: true,
  },
  employmentEndDate: {
    type: Date,
    optional: true,
  },
  currentSalary: {
    type: Number,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
