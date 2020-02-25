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
  ehadDate: {
    type: Date,
  },
  referenceName: {
    type: String,
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
  contactNumber1: {
    type: String,
    optional: true,
  },
  contactNumber2: {
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
