import SimpleSchema from 'simpl-schema';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import {
  MessageStatus,
  MessageSource,
} from 'meteor/idreesia-common/constants/communication';
import { approvable, identifiable, timestamps } from '../common';
import KarkunFilter from './karkun-filter';

export default new SimpleSchema({
  messageBody: {
    type: String,
  },
  karkunFilters: {
    type: Array,
    optional: true,
  },
  'karkunFilters.$': {
    type: KarkunFilter,
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
})
  .extend(identifiable)
  .extend(approvable)
  .extend(timestamps);
