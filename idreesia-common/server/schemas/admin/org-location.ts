import SimpleSchema from 'simpl-schema';

import { OrgLocationTypeValues } from 'meteor/idreesia-common/constants/organization';
import { identifiable, timestamps } from '../common';

const MehfilDetailsSchema = new SimpleSchema({
  address: { type: String, optional: true },
  mehfilStartYear: { type: String, optional: true },
  timingDetails: { type: String, optional: true },
  lcdAvailability: { type: Boolean, optional: true },
  tabAvailability: { type: Boolean, optional: true },
  otherMehfilDetails: { type: String, optional: true },
  latitude: { type: Number, optional: true },
  longitude: { type: Number, optional: true },
});

export default new SimpleSchema({
  name: {
    type: String,
  },
  type: {
    type: String,
    allowedValues: OrgLocationTypeValues,
  },
  parentId: {
    type: String,
    optional: true,
  },
  allParentIds: {
    type: Array,
    optional: true,
  },
  'allParentIds.$': {
    type: String,
  },
  mehfilDetails: {
    type: MehfilDetailsSchema,
    optional: true,
  },
  // Karkuns who observe this location.
  observerKarkunIds: {
    type: Array,
    optional: true,
  },
  'observerKarkunIds.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
