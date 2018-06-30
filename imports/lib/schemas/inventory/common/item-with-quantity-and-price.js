import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  stockItemId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  quantity: {
    type: Number,
  },
  price: {
    type: Number,
    optional: true,
  },
});
