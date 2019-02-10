import SimpleSchema from "simpl-schema";

import { identifiable, timestamps } from "../common";

export default new SimpleSchema({
  name: {
    type: String,
  },
  parentId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
