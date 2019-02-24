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
  amount: {
    type: Number
  },
  type: {
    type: String
  },
  categoryId: {
    type: String,
    optional: true
  }
})
  .extend(identifiable)
  .extend(timestamps);
