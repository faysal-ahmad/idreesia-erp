import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  parentName: {
    type: String,
  },
  cnicNumber: {
    type: String,
    optional: true,
  },
  birthDate: {
    type: Date,
    optional: true,
  },
  ehadDate: {
    type: Date,
  },
  referenceName: {
    type: String,
  },
  // TODO: remove this
  address: {
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
  city: {
    type: String,
    optional: true,
  },
  country: {
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
  educationalQualification: {
    type: String,
    optional: true,
  },
  meansOfEarning: {
    type: String,
    optional: true,
  },
  criminalRecord: {
    type: String,
    optional: true,
  },
  otherNotes: {
    type: String,
    optional: true,
  },
  imageId: {
    type: String,
    optional: true,
  },
  dataSource: {
    type: String,
    optional: true,
  },
  karkunId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
