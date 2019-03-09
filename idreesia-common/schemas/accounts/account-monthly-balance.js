import SimpleSchema from "simpl-schema";

import { identifiable, timestamps } from "../common";

export default new SimpleSchema({
  companyId: {
    type: String
  },
  accountHeadId: {
    type: String
  },
  monthString: {
    type: String
  },
  prevBalance: {
    type: Number
  },
  debits: {
    type: Number
  },
  credits: {
    type: Number
  },
  balance: {
    type: Number
  }
})
  .extend(identifiable)
  .extend(timestamps);
