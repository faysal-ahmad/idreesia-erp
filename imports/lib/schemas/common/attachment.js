import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  name: {
    type: String,
    optional: true,
  },
  mimeType: {
    type: String,
  },
  data: {
    type: String,
  },
});
