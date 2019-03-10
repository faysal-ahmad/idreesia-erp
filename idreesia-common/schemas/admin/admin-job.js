import SimpleSchema from "simpl-schema";

import { identifiable, timestamps } from "../common";

export default new SimpleSchema({
  jobType: {
    type: String
  },
  jobDetails: {
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
  },
  errorDetails: {
    type: String,
    optional: true
  }
})
  .extend(identifiable)
  .extend(timestamps);
