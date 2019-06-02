import SimpleSchema from "simpl-schema";

import { identifiable, timestamps } from "../common";

export default new SimpleSchema({
  firstName: {
    type: String
  },
  lastName: {
    type: String,
    optional: true
  },
  cnicNumber: {
    type: String,
    optional: true
  },
  address: {
    type: String,
    optional: true
  },
  city: {
    type: String,
    optional: true
  },
  country: {
    type: String,
    optional: true
  },
  contactNumber1: {
    type: String,
    optional: true
  },
  contactNumber2: {
    type: String,
    optional: true
  },
  imageId: {
    type: String,
    optional: true
  },
  attachmentIds: {
    type: Array,
    optional: true
  },
  "attachmentIds.$": {
    type: String
  }
})
  .extend(identifiable)
  .extend(timestamps);
