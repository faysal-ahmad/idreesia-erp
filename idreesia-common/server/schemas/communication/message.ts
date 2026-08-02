import SimpleSchema from 'simpl-schema';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import {
  MessageStatus,
  MessageSource,
} from 'meteor/idreesia-common/constants/communication';
import { approvable, identifiable, timestamps } from '../common';
import RecepientFilter from './recepient-filter';

export default new SimpleSchema({
  messageBody: {
    type: String,
  },
  recepientFilters: {
    type: Array,
    optional: true,
  },
  'recepientFilters.$': {
    type: RecepientFilter,
    optional: true,
  },
  source: {
    type: String,
    allowedValues: values(MessageSource),
  },
  status: {
    type: String,
    allowedValues: values(MessageStatus),
  },
  sentDate: {
    type: Date,
    optional: true,
  },
  karkunIds: {
    type: Array,
    optional: true,
  },
  'karkunIds.$': {
    type: String,
  },
  visitorIds: {
    type: Array,
    optional: true,
  },
  'visitorIds.$': {
    type: String,
  },
  succeededPhoneNumbers: {
    type: Array,
    optional: true,
  },
  'succeededPhoneNumbers.$': {
    type: String,
  },
  failedPhoneNumbers: {
    type: Array,
    optional: true,
  },
  'failedPhoneNumbers.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(approvable)
  .extend(timestamps);
