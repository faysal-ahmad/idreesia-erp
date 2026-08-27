import SimpleSchema from 'simpl-schema';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import { ImageVectorStatus } from 'meteor/idreesia-common/constants';

const ImageVectorData = new SimpleSchema({
  vector: {
    type: Array,
    optional: true,
  },
  'vector.$': {
    type: Number,
  },
  status: {
    type: String,
    allowedValues: values(ImageVectorStatus),
  },
  computedAt: {
    type: Date,
  },
  modelVersion: {
    type: String,
  },
});

export default new SimpleSchema({
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
  birthDate: {
    type: Date,
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
  ehadDate: {
    type: Date,
    optional: true,
  },
  deathDate: {
    type: Date,
    optional: true,
  },
  referenceName: {
    type: String,
    optional: true,
  },
  imageId: {
    type: String,
    optional: true,
  },
  imageVectorData: {
    type: ImageVectorData,
    optional: true,
  },
  tagIds: {
    type: Array,
    optional: true,
  },
  'tagIds.$': {
    type: String,
  },
});
