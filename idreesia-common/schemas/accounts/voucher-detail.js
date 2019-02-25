import SimpleSchema from "simpl-schema";

import { identifiable, timestamps } from "../common";

export default new SimpleSchema({
  companyId: {
    type: String
  },
  externalReferenceId: {
    type: String,
    optional: true
  },
  voucherId: {
    type: String
  },
  accountHeadId: {
    type: String
  },
  amount: {
    type: Number
  },
  isCredit: {
    type: Boolean
  }
})
  .extend(identifiable)
  .extend(timestamps);
