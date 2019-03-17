import SimpleSchema from "simpl-schema";

import { identifiable, timestamps } from "../common";

export default new SimpleSchema({
  fromCity: {
    type: String,
    optional: true
  },
  receivedDate: {
    type: Date
  },
  totalAmount: {
    type: Number
  },
  hadiaPortion: {
    type: Number,
    optional: true
  },
  sadqaPortion: {
    type: Number,
    optional: true
  },
  zakaatPortion: {
    type: Number,
    optional: true
  },
  langarPortion: {
    type: Number,
    optional: true
  },
  otherPortion: {
    type: Number,
    optional: true
  },
  otherPortionDescription: {
    type: String,
    optional: true
  }
})
  .extend(identifiable)
  .extend(timestamps);
