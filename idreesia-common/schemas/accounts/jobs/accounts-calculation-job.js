import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  companyId: {
    type: String
  },
  number: {
    type: String
  },
  startingMonth: {
    type: String,
    optional: true
  }
});
