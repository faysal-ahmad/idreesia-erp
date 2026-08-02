import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  stockItemId: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  isInflow: {
    type: Boolean,
  },
});
