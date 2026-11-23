import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: { type: String },
  unit: { type: String },
  category: { type: String, optional: true },
  // The brand or maker of the item.
  company: { type: String, optional: true },
  // Object storage key of the item's picture (purchasing-catalog-item-images/...).
  imageKey: { type: String, optional: true },
  description: { type: String, optional: true },
  defaultUnitPrice: { type: Number, optional: true, min: 0 },
  // Set when a purchase order that uses the item is approved.
  lastUnitPrice: { type: Number, optional: true, min: 0 },
  lastVendorId: { type: String, optional: true },
  isActive: { type: Boolean },
})
  .extend(identifiable)
  .extend(timestamps);
