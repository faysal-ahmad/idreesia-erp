import SimpleSchema from "simpl-schema";

import { identifiable } from "../common";

export default new SimpleSchema({
  karkunId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  dutyId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  shiftId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  month: {
    type: String,
    optional: true
  },
  absentCount: {
    type: Number,
    optional: true
  },
  presentCount: {
    type: Number,
    optional: true
  },
  percentage: {
    type: Number,
    optional: true
  },
  meetingCardBarcodeId: {
    type: String
  }
}).extend(identifiable);
