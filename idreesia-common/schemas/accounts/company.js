import SimpleSchema from "simpl-schema";

import { identifiable, timestamps } from "../common";

export default new SimpleSchema({
  name: {
    type: String
  },
  importData: {
    type: Boolean
  },
  connectivitySettings: {
    type: String,
    optional: true
  }
})
  .extend(identifiable)
  .extend(timestamps);
