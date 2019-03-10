import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  companyId: {
    type: String
  },
  importForMonth: {
    type: String,
    optional: true
  }
});
