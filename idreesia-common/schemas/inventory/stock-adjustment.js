import SimpleSchema from "simpl-schema";

import { approvable, identifiable, timestamps } from "../common";

export default new SimpleSchema({
  physicalStoreId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  stockItemId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  adjustmentDate: {
    type: Date
  },
  adjustedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  quantity: {
    type: Number
  },
  isInflow: {
    type: Boolean
  },
  adjustmentReason: {
    type: String,
    optional: true
  }
})
  .extend(approvable)
  .extend(identifiable)
  .extend(timestamps);
