import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  rosterId: {
    type: String,
  },
  dutyId: {
    type: String,
  },
  locationId: {
    type: String,
  },
  shiftId: {
    type: String,
  },
  shiftName: {
    type: String,
  },
  date: {
    type: String,
  },
  karkuns: {
    type: Array,
    optional: true,
  },
  'karkuns.$': {
    type: Object,
  },
  'karkuns.$.karkunId': {
    type: String,
  },
  'karkuns.$.name': {
    type: String,
  },
  'karkuns.$.sources': {
    type: Array,
  },
  'karkuns.$.sources.$': {
    type: Object,
  },
  'karkuns.$.sources.$.type': {
    type: String,
    allowedValues: ['team', 'direct', 'one-off'],
  },
  'karkuns.$.sources.$.teamId': {
    type: String,
    optional: true,
  },
  'karkuns.$.sources.$.teamName': {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
