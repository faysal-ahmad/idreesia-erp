import SimpleSchema from "simpl-schema";

import { identifiable, timestamps } from "../common";

export default new SimpleSchema({
  name: {
    type: String
  },
  startTime: {
    type: String,
    optional: true
  },
  endTime: {
    type: String,
    optional: true
  }
})
  .extend(identifiable)
  .extend(timestamps);
