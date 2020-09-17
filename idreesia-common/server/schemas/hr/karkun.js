import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  // Points to login account if one exists for this karkun
  userId: {
    type: String,
    optional: true,
  },
  name: {
    type: String,
  },
  parentName: {
    type: String,
    optional: true,
  },
  cnicNumber: {
    type: String,
    optional: true,
  },
  currentAddress: {
    type: String,
    optional: true,
  },
  permanentAddress: {
    type: String,
    optional: true,
  },
  cityId: {
    type: String,
    optional: true,
  },
  cityMehfilId: {
    type: String,
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
  contactNumber1Subscribed: {
    type: Boolean,
    optional: true,
  },
  contactNumber2Subscribed: {
    type: Boolean,
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
  birthDate: {
    type: Date,
    optional: true,
  },
  ehadDate: {
    type: Date,
    optional: true,
  },
  deathDate: {
    type: Date,
    optional: true,
  },
  lastTarteebDate: {
    type: Date,
    optional: true,
  },
  mehfilRaabta: {
    type: String,
    optional: true,
  },
  msRaabta: {
    type: String,
    optional: true,
  },
  msLastVisitDate: {
    type: Date,
    optional: true,
  },
  referenceName: {
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
})
  .extend(identifiable)
  .extend(timestamps);
