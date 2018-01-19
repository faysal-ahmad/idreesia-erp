import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  itemStockId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  quantity: {
    type: Number
  }
});
