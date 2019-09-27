import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
});
