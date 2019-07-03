import SimpleSchema from "simpl-schema";

import { identifiable } from "../common";

export default new SimpleSchema({
  visitorId: {
    type: String
  },
  fromDate: {
    type: Date
  },
  toDate: {
    type: Date
  },
  approved: {
    type: Boolean
  },
  approvedOn: {
    type: Date,
    optional: true
  },
  approvedBy: {
    type: String,
    optional: true
  },
  approvalNotes: {
    type: String,
    optional: true
  }
}).extend(identifiable);
