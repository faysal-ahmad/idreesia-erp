import SimpleSchema from 'simpl-schema';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import { FilterTarget } from 'meteor/idreesia-common/constants/communication';

export default new SimpleSchema({
  filterTarget: {
    type: String,
    allowedValues: values(FilterTarget),
  },
  name: {
    type: String,
    optional: true,
  },
  cnicNumber: {
    type: String,
    optional: true,
  },
  phoneNumber: {
    type: String,
    optional: true,
  },
  bloodGroup: {
    type: String,
    optional: true,
  },
  lastTarteeb: {
    type: String,
    optional: true,
  },
  attendance: {
    type: String,
    optional: true,
  },
  isEmployee: {
    type: Boolean,
    optional: true,
  },
  jobIds: {
    type: Array,
    optional: true,
  },
  'jobIds.$': {
    type: String,
  },
  dutyIds: {
    type: Array,
    optional: true,
  },
  'dutyIds.$': {
    type: String,
  },
  dutyShiftIds: {
    type: Array,
    optional: true,
  },
  'dutyShiftIds.$': {
    type: String,
  },
  cityId: {
    type: String,
    optional: true,
  },
  cityMehfilId: {
    type: String,
    optional: true,
  },
  region: {
    type: String,
    optional: true,
  },
  userIds: {
    type: Array,
    optional: true,
  },
  'userIds.$': {
    type: String,
  },
});
