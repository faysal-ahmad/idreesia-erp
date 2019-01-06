import SimpleSchema from "simpl-schema";

export default new SimpleSchema({
  stockItemId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  quantity: {
    type: Number,
  },
  isInflow: {
    type: Boolean,
  },
  price: {
    type: Number,
    optional: true,
  },
});
