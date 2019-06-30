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
  }
}).extend(identifiable);
