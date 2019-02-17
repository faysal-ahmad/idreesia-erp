import SimpleSchema from "simpl-schema";

import { identifiable, timestamps } from "../common";

export default new SimpleSchema({
  companyId: {
    type: String
  },
  status: {
    type: String,
    allowedValues: ["queued", "processing", "completed", "errored"]
  },
  logs: {
    type: Array,
    optional: true
  },
  "logs.$": {
    type: String
  }
})
  .extend(identifiable)
  .extend(timestamps);
