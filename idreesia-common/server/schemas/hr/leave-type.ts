import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

// A kind of leave (Casual, Sick, ...). The day counts are set by HR.
export default new SimpleSchema({
  name: {
    type: String,
  },
  annualEntitlementDays: {
    type: Number,
    min: 0,
  },
  isPaid: {
    type: Boolean,
  },
  allowCarryForward: {
    type: Boolean,
  },
  // Most days that carry into the next year. Missing means no limit.
  maxCarryForwardDays: {
    type: Number,
    min: 0,
    optional: true,
  },
  isActive: {
    type: Boolean,
  },
})
  .extend(identifiable)
  .extend(timestamps);
